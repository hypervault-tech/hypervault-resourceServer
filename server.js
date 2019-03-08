const express = require('express');
const app = express();
const port = 2019;
const mkdirp = require('mkdirp');

const bodyParser = require('body-parser');
const cors = require('cors');

// first attempt to make ./resources/ directory to store all the files
try {
  mkdirp.sync("./resources");
  mkdirp.sync("./resources/capsules");
  mkdirp.sync("./resources/ciphertexts");
  mkdirp.sync("./temp");  // place to temporarily hold all uploads: if the uploaded file has a hash matching that declared in the blockchain, it will be copied t the resources folder
} catch (e) {
  throw e;
}

const apiRouter = require("./routes/api");

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cors());

// parse application/json
app.use(bodyParser.json())

app.use("/api", apiRouter);

app.listen(port, () => console.log(`Hypervault ResourceServer listening on port ${port}!`));

module.exports = app; // for Mocha testing purposes only