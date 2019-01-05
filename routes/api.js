const express = require('express');
const router = express.Router();
const wrapper = require("../controllers/wrapper");
const package = require("../package.json");

const multer  = require('multer');
const upload = multer({ dest: './temp/' });

router.get('/', async function (req, res) {
  pingResponse = await wrapper.pingNetwork();
  res.status(200).send({
    version: package.version,
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
      res.status(404).send("No resource is found with the given resourceId.");
    }
    // next check status of resource
    if(resource.status !== "PENDING_TRANSFER") {
      res.status(400).send(`Resource status needs to be "PENDING_TRANSFER" for the resource to be accepted. `)
    } else {
      // proceed to check if owner exists
      try {
        const user = await wrapper.getResourceOwner(resourceId);
      } catch(e) {
        res.status(400).send(`Something is wrong with the owner of the resource as the database gives an error when trying to read the user details.`);
      }

      // next check hash of the file

    }
  }catch(e) {
    console.error(e);
    res.status(500).send("Something went wrong. Please try again later.");
  }
}