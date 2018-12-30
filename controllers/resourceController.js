const request = require("request-promise");
const hypervaultAPIurl = "http://resourceserver.hypervault.tech:3000/api/";
// const hypervaultAPIurl = "http://localhost:3000/api/";


/**
 * This async function submits a PUT request to the API and updates the status of the resource with `resourceId` to "AVAILABLE"
 * @param {String} resourceId 
 */
async function updateResource(resourceId) {
  try {
    const resString = await request.get(hypervaultAPIurl + "tech.hypervault.Resource/" + resourceId);
    const resource = JSON.parse(resString); 
    resource.status = "AVAILABLE";
    await request.put(hypervaultAPIurl + "tech.hypervault.Resource/" + resourceId, {
      json: true,
      body: resource
    });
  } catch(e) {
    throw e;
  }
}

/**
 * getAllResources from the hypervault REST API
 */
async function getAllResources() {
  const resString = await request.get(hypervaultAPIurl+"tech.hypervault.Resource");
  return JSON.parse(resString);
}

// export the methods
module.exports = {
  updateResource: updateResource,
  hypervaultAPIurl: hypervaultAPIurl,
  getAllResources: getAllResources,
}