const hasha = require('hasha');

/**
 * Syncrhonously hashes a file using sha256
 * @param {String} filepath 
 */
function hashFile(filepath) {
  return hasha.fromFileSync(filepath, {algorithm:"sha256"});
}



module.exports = {
  hashFile: hashFile,
}