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
  const resString = await request.get(hypervaultAPIurl+"tech.hypervault.User");
  const users = JSON.parse(resString);
  return res.send(users);
}