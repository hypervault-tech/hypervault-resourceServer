const express = require('express');
const router = express.Router();
const request = require("request-promise");
const hypervaultAPIurl = "http://resourceserver.hypervault.tech:3000/api/";
// const hypervaultAPIurl = "http://localhost:3000/api/";

// define the home page route
router.get('/', function (req, res) {
  res.send('Hello world from API');
});

// define the about route
router.get('/test', testHandler);

module.exports = router;


async function testHandler(req, res) {
  await updateResource("file1");
  const resString = await request.get(hypervaultAPIurl+"tech.hypervault.Resource");
  const resources = JSON.parse(resString);
  return res.send(resources);
}

/**
 * This async function submits a PUT request to the API and updates the status of the resource with `resourceId` to "AVAILABLE"
 * @param {String} resourceId 
 */
async function updateResource(resourceId) {
  try {
    const resString = await request.get(hypervaultAPIurl + "tech.hypervault.Resource/" + resourceId);
    const resource = JSON.parse(resString); 
    resource.status = "AVAILABLE";
    await request.put(hypervaultAPIurl + "tech.hypervault.Resource/" + resourceId, {
      json: true,
      body: resource
    });
  } catch(e) {
    throw e;
  }
  
}