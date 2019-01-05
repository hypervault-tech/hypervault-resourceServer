const express = require('express');
const router = express.Router();
const wrapper = require("../controllers/wrapper");
const apiConfig = require("../config");
const fileUtil = require("../controllers/fileUtils");

const multer  = require('multer');
const upload = multer({ dest: apiConfig.tempResourcesPath });

// to handle files
const fs = require("fs");
const util = require('util');
const copyFile = util.promisify(fs.copyFile);
const unlink = util.promisify(fs.unlink);

router.get('/', async function (req, res) {
  pingResponse = await wrapper.pingNetwork();
  return res.status(200).send({
    version: apiConfig.version,
    serverParticipant: pingResponse.participant
  });
});

router.post('/upload/:resourceId', upload.single('resource'), uploadHandler);

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