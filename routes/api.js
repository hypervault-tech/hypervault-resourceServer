const express = require('express');
const router = express.Router();
const wrapper = require("../controllers/wrapper");
const apiConfig = require("../config");
const fileUtil = require("../controllers/fileUtils");
const cryptoUtil = require("../controllers/cryptoUtils");

const multer  = require('multer');
const upload = multer({ dest: apiConfig.tempResourcesPath, limits: { fileSize: apiConfig.maxSize } });

// to handle files
const fs = require("fs");
const path = require("path");
const util = require('util');
const copyFile = util.promisify(fs.copyFile);
const unlink = util.promisify(fs.unlink);
// const spawn = util.promisify(require('child_process').spawnSync);
const spawn = require('child_process').spawnSync;

router.get('/', async function (req, res) {
  pingResponse = await wrapper.pingNetwork();
  return res.status(200).send({
    version: apiConfig.version,
    serverParticipant: pingResponse.participant
  });
});

router.post('/upload/:resourceId', upload.single('resource'), uploadHandler);
router.post('/secureUpload/:resourceId', upload.single('resource'), secureUploadHandler);

router.head('/download/:transactionId/:signature', headDownloadHandler);
router.get('/download/:transactionId/:signature', downloadHandler);

module.exports = router;

///////////////////////////////////////////////////////////////////////////
// Route Handler functions
///////////////////////////////////////////////////////////////////////////

async function uploadHandler(req, res) {
  // file is saved to ./temp
  const resourceId = req.params.resourceId;
  try {
    // first check if a file has been uploaded
    if (req.hasOwnProperty("file") == false)  {
      return res.status(400).send("One and only one attached file is required. ");
    }

    const resource = await wrapper.getResource(resourceId);
    // next check if the resource exists
    if(resource == null) {
      await unlink(req.file.path);
      return res.status(404).send("No resource is found with the given resourceId.");
    }
    // next check status of resource
    if(resource.status !== "PENDING_TRANSFER") {
      await unlink(req.file.path);
      return res.status(400).send(`Resource status needs to be "PENDING_TRANSFER" for the resource to be accepted. `)
    } 
    // proceed to check if owner exists
    try {
      const user = await wrapper.getResourceOwner(resourceId);
    } catch(e) {
      await unlink(req.file.path);
      return res.status(400).send(`Something is wrong with the owner of the resource as the database gives an error when trying to read the user details.`);
    }

    // Finally check hash of the file
    const filehash = fileUtil.hashFile( req.file.path );
    if(filehash !== resource.resourceId) {
      await unlink(req.file.path);
      return res.status(400).send("The filehash does not match the resourceId. ");
    } 

    // now all checks are completed. Proceed to save the file and make it available. 
    await copyFile(req.file.path, `${apiConfig.resourcesPath}/${resource.resourceId}`);
    await unlink(req.file.path);
    await wrapper.updateResource(resource.resourceId); 
    // now return successful response 
    return res.status(201).send(resource.resourceId);

  }catch(e) {
    console.error(e);
    return res.status(500).send("Something went wrong. Please try again later.");
  }
}

async function downloadHandler(req, res) {
  const transactionId = req.params.transactionId;
  try {
    // First of all verify if the request is PENDING
    const requestVerification = await wrapper.verifyPendingRequest(transactionId);
    if (requestVerification === null) {
      return res.status(404).send();
    }
    if (requestVerification !== true) {
      return res.status(400).send();
    }

    const pRequest = await wrapper.getRequest(transactionId);
    const resourceId = wrapper.util.getIdentifier(pRequest.resource);
    const userId = wrapper.util.getIdentifier(pRequest.user);
    const user = await wrapper.getUser(userId);

    // Next check if the resource is AVAILABLE
    const resource = await wrapper.getResource(resourceId);
    if (resource === null) return res.status(404).send();
    if (resource.status !== "AVAILABLE") return res.status(404).send();
    var filename = "anonymousFile.hypervault";
    if(resource.hasOwnProperty("filename")) filename = resource.filename;
    
    // check if file is encrypted 
    if( fs.existsSync( path.join(__dirname,"../", apiConfig.resourcesPath, resourceId) ) ) {
      // the file is not encrypted
      // first of all update Request 
      await wrapper.updateRequest(transactionId);
      return res.status(200).download(path.join(__dirname,"../", apiConfig.resourcesPath, resourceId), filename);
    } else {
      // file is encrypted need to reencrypt using NyCypher

      // first check that the keys query string is properly formatted
      var keys;
      try {
        keys = JSON.parse(req.query.keys);
      } catch(e){
        return res.status(400).send("Bad encryption keys. Please make sure that you have pasted the keys correctly. ");
      }

      var ownerId = await wrapper.util.getIdentifier(resource.owner);
      var owner = await wrapper.getUser(ownerId);
      var ownerPubKeys = JSON.parse(owner.pubKey);
      var NuCypher = spawn( "python3", [ path.join(__dirname,"../pythonScripts/reencryptDecrypt.py"), ownerPubKeys.publicKey, keys.privateKey, ownerPubKeys.verifyingKey, resource.resourceId ] );
      if(NuCypher.stderr.toString()) {
        res.status(401).send("The encryption keys provided are invalid. ");
        console.error(NuCypher.stderr.toString());
      }
      //check if the decrypted file exists
      if( fs.existsSync( path.join(__dirname,"../", apiConfig.tempResourcesPath, "decrypted") ) ) {
        // first of all update Request 
        await wrapper.updateRequest(transactionId);
        res.status(200).download( path.join(__dirname,"../", apiConfig.tempResourcesPath, "decrypted"), filename);
        // finally remove the file
        req.on("end", () => fs.unlinkSync( path.join(__dirname,"../", apiConfig.tempResourcesPath, "decrypted") ) );
        return;
      } else {
        res.status(500).send();
      }

    }

    

  } catch(e) {
    throw e;
  }
  
}


async function headDownloadHandler(req, res) {
  const transactionId = req.params.transactionId;
  try {
    // First of all verify if the request is PENDING
    const requestVerification = await wrapper.verifyPendingRequest(transactionId);
    if (requestVerification === null) {
      return res.status(404).send("Transaction not found");
    }
    if (requestVerification !== true) {
      return res.status(400).send("Transaction is invalid");
    }

    const pRequest = await wrapper.getRequest(transactionId);
    const resourceId = wrapper.util.getIdentifier(pRequest.resource);
    const userId = wrapper.util.getIdentifier(pRequest.user);

    // Next check if the resource is AVAILABLE
    const resource = await wrapper.getResource(resourceId);
    if (resource === null) return res.status(404).send();
    if (resource.status !== "AVAILABLE") return res.status(404).send();

    // finally check the validity of the keys 
    var validity = await isValidKeys(req.query.keys);
    if ( validity != true) {
      return res.status(401).send("The encryption keys provided are invalid. ");
    }
    return res.status(202).send();
  } catch(e) {
    throw e;
  }
  
}

/**
 * The params need to have a resource: the file uploaded
 * AS WELL AS a `keys` field which is a json object containing all the keys of the user. 
 */
async function secureUploadHandler(req, res) {
  // file is saved to ./temp
  const resourceId = req.params.resourceId;
  try {
    // first check if a file has been uploaded
    if (req.hasOwnProperty("file") == false)  {
      return res.status(400).send("One and only one attached file is required. ");
    }

    const resource = await wrapper.getResource(resourceId);
    // next check if the resource exists
    if(resource == null) {
      await unlink(req.file.path);
      return res.status(404).send("No resource is found with the given resourceId.");
    }
    // next check status of resource
    if(resource.status !== "PENDING_TRANSFER") {
      await unlink(req.file.path);
      return res.status(400).send(`Resource status needs to be "PENDING_TRANSFER" for the resource to be accepted. `)
    } 
    // proceed to check if owner exists
    var user = {};
    try {
      user = await wrapper.getResourceOwner(resourceId);
    } catch(e) {
      await unlink(req.file.path);
      return res.status(400).send(`Something is wrong with the owner of the resource as the database gives an error when trying to read the user details.`);
    }

    // Finally check hash of the file
    const filehash = fileUtil.hashFile( req.file.path );
    if(filehash !== resource.resourceId) {
      await unlink(req.file.path);
      return res.status(400).send("The filehash does not match the resourceId. ");
    } 

    // now all checks are completed. Proceed to save and encrypt the file and make it available. 
    await copyFile(req.file.path, `${apiConfig.resourcesPath}/${resource.resourceId}`);
    await unlink(req.file.path);

    // NuCypher encryption for all current users (for now. TODO: ask for list of users)

    // first encrypt with the owner's public key
    var ownerKeys = JSON.parse(req.body.keys);
    var NuCypher = spawn( "python3", [ path.join(__dirname,"../pythonScripts/encrypt.py"), ownerKeys.publicKey, resource.resourceId ] );
    if(NuCypher.stderr.toString()) {
      throw Error(NuCypher.stderr.toString());
    }

    var pubKeys = await wrapper.getAllPublicKeys();
    pubKeys.forEach((pubKey) => {
      spawn( "python3", [ path.join(__dirname,"../pythonScripts/generateKfrags.py"), ownerKeys.privateKey, ownerKeys.signingKey, pubKey, resource.resourceId, 1, 1 ] );
      if(NuCypher.stderr.toString()) {
        throw Error(NuCypher.stderr.toString());
      }
    });

    // now delete the unencrypted file
    await unlink(`${apiConfig.resourcesPath}/${resource.resourceId}`);

    // now return successful response 
    await wrapper.updateResource(resource.resourceId); 
    return res.status(201).send(resource.resourceId);

  }catch(e) {
    console.error(e);
    return res.status(500).send("Something went wrong. Please try again later.");
  }
}



/**
 * This function checks whether the given set of keys are valid (in the sense that the public keys come from the correct private keys)
 * @param {String} keys - The JSON string containing the four keys
 * @param {String} userId 
 * @returns {True} - If the keys are valid in the sense specified above
 */
async function isValidKeys(keys){
  try {
    var validity = true;
    // try to parse the given keys
    var keysObj;
    try {
      keysObj = JSON.parse(keys);
    } catch (error) {
      return false;
    }

    var NuCypher = spawn( "python3", [ path.join(__dirname,"../pythonScripts/getPublicKey.py"), keysObj.privateKey ] );
    if ( NuCypher.stdout.toString().trim() != keysObj.publicKey) {
      validity = false;
    }
    var NuCypher = spawn( "python3", [ path.join(__dirname,"../pythonScripts/getPublicKey.py"), keysObj.signingKey ] );
    if ( NuCypher.stdout.toString().trim() != keysObj.verifyingKey) {
      validity = false;
    }

    return validity;

  } catch (e) {
    if (e.statusCode === 404) {
      return null;
    } else {
      throw e;
    }
  }
}