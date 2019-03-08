const request = require("request-promise");
const APIconfig = require("../config");
const hypervaultAPIurl = APIconfig.composerAPIurl;


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
 * This async function submits a PUT request to the API and updates the status of the request with `transactionId` to "FULFILLED"
 * @param {String} transactionId 
 */
async function updateRequest(transactionId) {
  try {
    const resString = await request.get(hypervaultAPIurl + "tech.hypervault.Request/" + transactionId);
    const pReq = JSON.parse(resString); 
    pReq.status = "FULFILLED";
    await request.put(hypervaultAPIurl + "tech.hypervault.Request/" + transactionId, {
      json: true,
      body: pReq
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

/**
 * Get the resource with some resourceId. Returns `null` if none is found, but throws an error if an error occurs. 
 * @param {String} resourceId 
 */
async function getResource(resourceId) {
  try {
    const resString = await request.get(hypervaultAPIurl + "tech.hypervault.Resource/" + resourceId);
    return JSON.parse(resString);
  } catch (e) {
    if (e.statusCode === 404) {
      return null;
    } else {
      throw e;
    }
  }
}

/**
 * Get the request with some transactionId. Returns `null` if none is found, but throws an error if an error occurs. 
 * @param {String} transactionId 
 */
async function getRequest(transactionId) {
  try {
    const resString = await request.get(hypervaultAPIurl + "tech.hypervault.Request/" + transactionId);
    return JSON.parse(resString);
  } catch (e) {
    if (e.statusCode === 404) {
      return null;
    } else {
      throw e;
    }
  }
}

/**
 * This async function queries the ledger to see if the request asset exists and if it does, it check if the status if "PENDING". 
 * If the request is valid, this function returns true, otherwise it will return false. If an error has occurred, an exception will be raised. If no request is found, it returns null. 
 * @param {String} requestTransactionId - the transactionId (the identifier) of the Request asset
 */
async function verifyPendingRequest(requestTransactionId) {
  try {
    const resString = await request.get(hypervaultAPIurl + "tech.hypervault.Request/" + requestTransactionId);
    const pRequest = JSON.parse(resString);
    if(pRequest.status === "PENDING") {
      return true;
    } else {
      return false;
    }
  } catch(e) {
    if (e.statusCode === 404) {
      return null;
    } else {
      throw e;
    }
  }
}

/**
 * Returns the owner of the resource. If either resource or the owner does not exist, an ERROR is raised. 
 * @param {String} resourceId 
 */
async function getResourceOwner(resourceId) {
  try {
    const resource = await getResource(resourceId);
    if(resource != null) {
      // attempt to get owner
      const userId = getIdentifier(resource.owner);
      const resString = await request.get(hypervaultAPIurl + "tech.hypervault.User/" + userId);
      return JSON.parse(resString);
    } else {
      throw Error("Resource does not exist");
    }
  }catch(e) {
    throw e;
  }
}

/**
 * Get the User with some userId. Returns `null` if none is found, but throws an error if an error occurs. 
 * @param {String} userId 
 */
async function getUser(userId) {
  try {
    const resString = await request.get(hypervaultAPIurl + "tech.hypervault.User/" + userId);
    return JSON.parse(resString);
  } catch (e) {
    if (e.statusCode === 404) {
      return null;
    } else {
      throw e;
    }
  }
}

/**
 * Get all users.
 */
async function getAllUsers() {
  try {
    const resString = await request.get(hypervaultAPIurl + "tech.hypervault.User/");
    return JSON.parse(resString);
  } catch (e) {
    if (e.statusCode === 404) {
      return null;
    } else {
      throw e;
    }
  }
}

/**
 * Get all public keys.
 */
async function getAllPublicKeys() {
  try {
    const users = await getAllUsers();
    var pubKeys = [];
    users.forEach(user => {
      pubKeys.push(user.pubKey);
    });
    return pubKeys;
  } catch (e) {
    if (e.statusCode === 404) {
      return null;
    } else {
      throw e;
    }
  }
}


/**
 * Example response from the ping request
 * {
      "version": "0.20.5",
      "participant": "org.hyperledger.composer.system.NetworkAdmin#admin",
      "identity": "org.hyperledger.composer.system.Identity#761644569f44e292d41a99402fb9df22810312dcc4ebe4a28347b4b7cbec6175"
    }
 */
async function pingNetwork() {
  try {
    const resString = await request.get(hypervaultAPIurl + "system/ping");
    return JSON.parse(resString);
  } catch(e) {
    throw e;
  }
}

///////////////////////////////////////////////////////////////////////////
// Utility functions
///////////////////////////////////////////////////////////////////////////

/**
 * Gets the identifier from a given relationship. For the example below, this will return "user1"
 * @param {String} relationshipIdentifier - example "resource:tech.hypervault.User#user1"
 */
function getIdentifier( relationshipIdentifier ) {
  const idArr = relationshipIdentifier.split("#");
  idArr.splice(0,1);
  return idArr.join("#");
}

const util = {
  getIdentifier: getIdentifier,
}


///////////////////////////////////////////////////////////////////////////
// Dev only functions
///////////////////////////////////////////////////////////////////////////


/**
 * ONLY for testing purposes. NOT TO BE USED IN API SERVER
 * @param {String} resourceId 
 * @param {String} resourceStatus - one of the valid status types
 */
async function putResource(resourceId, resourceStatus) {
  try {
    const resString = await request.get(hypervaultAPIurl + "tech.hypervault.Resource/" + resourceId);
    const resource = JSON.parse(resString); 
    resource.status = resourceStatus;
    await request.put(hypervaultAPIurl + "tech.hypervault.Resource/" + resourceId, {
      json: true,
      body: resource
    });
  } catch(e) {
    throw e;
  }
}

async function putRequest(transactionId, requestStatus) {
  try {
    const resString = await request.get(hypervaultAPIurl + "tech.hypervault.Request/" + transactionId);
    const pRequest = JSON.parse(resString); 
    pRequest.status = requestStatus;
    await request.put(hypervaultAPIurl + "tech.hypervault.Request/" + transactionId, {
      json: true,
      body: pRequest
    });
  } catch(e) {
    throw e;
  }
}

const devOnly = {
  putResource: putResource,
  putRequest:putRequest,
};


// export the methods
module.exports = {
  updateResource: updateResource,
  hypervaultAPIurl: hypervaultAPIurl,
  getAllResources: getAllResources,
  getResource:getResource,
  verifyPendingRequest: verifyPendingRequest,
  getResourceOwner:getResourceOwner,
  pingNetwork: pingNetwork,
  getRequest: getRequest,
  getUser: getUser,
  updateRequest:updateRequest,
  getAllUsers:getAllUsers, 
  getAllPublicKeys:getAllPublicKeys,

  // utility functions
  util: util,

  // dev only dunctions
  devOnly: devOnly
}