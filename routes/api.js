const express = require('express');
const router = express.Router();
const request = require("request-promise");
const wrapper = require("../controllers/wrapper");
const hypervaultAPIurl = wrapper.hypervaultAPIurl;

// define the home page route
router.get('/', function (req, res) {
  res.send('Hello world from API');
});

// define the about route
router.get('/test', testHandler);

module.exports = router;


async function testHandler(req, res) {
  await wrapper.updateResource("file1");
  const resources = await wrapper.getAllResources();
  return res.send(resources);
}
