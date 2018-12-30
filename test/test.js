const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiAsPromised = require("chai-as-promised");
 
const server = require('../server');
const should = chai.should();
const expect = chai.expect;
chai.use(chaiAsPromised);

const wrapper = require("../controllers/wrapper");

describe("Hypervault Resource Server", ()=> {

  describe("# wrapper", () => {

    it("- getAllResources(): should return at least 2 resources", async () => {  
      const resources = await wrapper.getAllResources();
      expect(resources.length).to.be.at.least(2);
    });

    it("- getResource( 'file1' ): should return a resource with id 'file1'", async () => {  
      const resource = await wrapper.getResource("file1");
      expect(resource).to.have.property("resourceId");
    });

    it("- getResource( 'fileThatDoesNotExist' ): should return null", async () => {  
      const resource = await wrapper.getResource("fileThatDoesNotExist");
      expect(resource).to.be.null;
    });

    it("- updateResource('file1'): The status of file1 should become 'AVAILABLE' ", async () => {  
      wrapper.updateResource("file1").should.eventually.be.fulfilled;
      const resource = await wrapper.getResource("file1");
      expect( resource.status ).to.equal("AVAILABLE");
    });

    it("- verifyPendingRequest: Request with id '...bb75' should be valid", async () => {  
      const isValid = await wrapper.verifyPendingRequest("3cb701d51dc94495dbdb25c614232757e8964dd9164457be830fc80f2dbebb75");
      expect(isValid).to.be.true;
    });

  });
});