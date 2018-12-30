const express = require('express');
const router = express.Router();
const request = require("request-promise");
const resourceController = require("../controllers/resourceController");
const hypervaultAPIurl = resourceController.hypervaultAPIurl;

// define the home page route
router.get('/', function (req, res) {
  res.send('Hello world from API');
});

// define the about route
router.get('/test', testHandler);

module.exports = router;


async function testHandler(req, res) {
  await resourceController.updateResource("file1");
  const resources = await resourceController.getAllResources();
  return res.send(resources);
}
