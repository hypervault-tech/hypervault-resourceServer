/**
 * DEV only utiilty script to generate cryptographic signature used for the api/download endpoint
 */

const cryptoUtil = require("./controllers/cryptoUtils");
const fs = require("fs");
const keyPath = "./test/user2.key";
const dataToBeSigned = "3cb701d51dc94495dbdb25c614232757e8964dd9164457be830fc80f2dbebb75";

const privateKey = fs.readFileSync(keyPath);
console.log(`Using the following privateKey located at ${keyPath} \n${privateKey}\n\n`)

console.log(`Signature of "test"\n${cryptoUtil.generateSignature(dataToBeSigned, privateKey)}\n`);