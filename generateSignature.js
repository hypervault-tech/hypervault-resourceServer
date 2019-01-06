/**
 * DEV only utiilty script to generate cryptographic signature used for the api/download endpoint
 */

const cryptoUtil = require("./controllers/cryptoUtils");
const fs = require("fs");
const keyPath = "./test/user1.key";
const dataToBeSigned = "test";

const privateKey = fs.readFileSync(keyPath);
console.log(`Using the following privateKey located at ${keyPath} \n${privateKey}\n\n`)

console.log(`Signature of "test"\n${cryptoUtil.generateSignature(dataToBeSigned, privateKey)}\n`);