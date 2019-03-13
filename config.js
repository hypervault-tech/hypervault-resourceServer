const config = {
  version: "0.2.1",
  // the full url should only be used for DEV purposes and the port 3000 should NOT be exposed in production mode
  // composerAPIurl: "http://resourceserver.hypervault.tech:3000/api/",
  composerAPIurl: "http://localhost:3000/api/",
  // DO NOT ADD TRALIING SLASHES
  
  // path to save all resources
  resourcesPath: "./resources",
  // path to hold temporary uploads
  tempResourcesPath: "./temp",

  maxSize: 10 * 1024 * 1024
}


module.exports = config