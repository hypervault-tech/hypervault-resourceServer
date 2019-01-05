const express = require('express');
const router = express.Router();
const wrapper = require("../controllers/wrapper");
const apiConfig = require("../config");
const fileUtil = require("../controllers/fileUtils");

const multer  = require('multer');
const upload = multer({ dest: apiConfig.tempResourcesPath });
const fs = require("fs");

router.get('/', async function (req, res) {
  pingResponse = await wrapper.pingNetwork();
  return res.status(200).send({
    version: apiConfig.version,
    serverParticipant: pingResponse.participant
  });
});

router.post('/upload/:resourceId', upload.single('resource'), uploadHandler);

router.get('/test', testHandler);

module.exports = router;

///////////////////////////////////////////////////////////////////////////
// Route Handler functions
///////////////////////////////////////////////////////////////////////////

async function testHandler(req, res) {
  await wrapper.updateResource("file1");
  const resources = await wrapper.getAllResources();
  return res.send(resources);
}

async function uploadHandler(req, res) {
  // file is saved to ./temp
  const resourceId = req.params.resourceId;
  try {
    const resource = await wrapper.getResource(resourceId);
    // first check if the resource exists
    if(resource == null) {
      return res.status(404).send("No resource is found with the given resourceId.");
    }
    // next check status of resource
    if(resource.status !== "PENDING_TRANSFER") {
      return res.status(400).send(`Resource status needs to be "PENDING_TRANSFER" for the resource to be accepted. `)
    } else {
      // proceed to check if owner exists
      try {
        const user = await wrapper.getResourceOwner(resourceId);
      } catch(e) {
        return res.status(400).send(`Something is wrong with the owner of the resource as the database gives an error when trying to read the user details.`);
      }

      // now check if the file has been uploaded
      if (req.hasOwnProperty("file") === true) {
        // next check hash of the file
        const filehash = fileUtil.hashFile( req.file.path );
        if(filehash !== resource.resourceId) {
          return res.status(400).send("The filehash does not match the resourceId. ");
        } else {
          // now all checks are completed. Proceed to save the file and make it available. 
          await fs.copyFile(req.file.path, `${apiConfig.resourcesPath}/${resource.resourceId}`);
          await fs.unlink(req.file.path);
          await wrapper.updateResource(resource.resourceId); 
          // now return successful response 
          res.status(201).send(resource.resourceId);
        }
      } else {
        return res.status(400).send("One and only one attached file is required. ");
      }
      
    }
  }catch(e) {
    console.error(e);
    return res.status(500).send("Something went wrong. Please try again later.");
  }
}