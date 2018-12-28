const express = require('express');
const app = express();
const port = 8081;

const apiRouter = require("./routes/api");

app.use("/api", apiRouter);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));