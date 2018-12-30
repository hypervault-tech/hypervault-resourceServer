const express = require('express');
const app = express();
const port = 8081;
const mkdirp = require('mkdirp');

// first attempt to make ./resources/ directory to store all the files
try {
  mkdirp.sync("./resources");
} catch (e) {
  throw e;
}

const apiRouter = require("./routes/api");

app.use("/api", apiRouter);

app.listen(port, () => console.log(`Hypervault ResourceServer listening on port ${port}!`));