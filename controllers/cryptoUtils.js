const crypto = require('crypto');
const signatureFormat = "hex";


/**
 * This function checks if a given signature is a valid signature of some data. 
 * @param {String} data - The data that is signed by the signature
 * @param {String} pubKey - The public key
 * @param {String} signature - The digital signature
 * @returns {Boolean} - true == correct
 */
function verifySignature(data, pubKey, signature) {
  const verify = crypto.createVerify('SHA256');
  verify.write(data);
  verify.end();
  return verify.verify(pubKey, signature, signatureFormat)
}


function generateSignature(data, privateKey) {
  const sign = crypto.createSign('SHA256');
  sign.write(data);
  sign.end();
  return sign.sign(privateKey, signatureFormat);
}


module.exports = {
  verifySignature: verifySignature,
  generateSignature: generateSignature,
}