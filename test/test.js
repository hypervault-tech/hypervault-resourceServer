const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiAsPromised = require("chai-as-promised");
 
const should = chai.should();
const expect = chai.expect;
chai.use(chaiAsPromised);
chai.use(chaiHttp);

const wrapper = require("../controllers/wrapper");
const fileUtils = require("../controllers/fileUtils");
const server = require("../server");
const fs = require("fs");

describe("Hypervault Resource Server", ()=> {

  describe("# wrapper", () => {

    before(async () => {
      try {
        // Reset the status of 'file1'
        await wrapper.devOnly.putResource("file1", "PENDING_TRANSFER");
      } catch(e) {
        throw e;
      }
    });

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
      await wrapper.updateResource("file1").should.eventually.be.fulfilled;
      const resource = await wrapper.getResource("file1");
      expect( resource.status ).to.equal("AVAILABLE");
    });

    it("- verifyPendingRequest: Request with id '...bb75' should be valid", async () => {  
      const isValid = await wrapper.verifyPendingRequest("3cb701d51dc94495dbdb25c614232757e8964dd9164457be830fc80f2dbebb75");
      expect(isValid).to.be.true;
    });

    it("- getResourceOwner('file1'): should return an User object with userId 'user1'", async () => {  
      const user = await wrapper.getResourceOwner("file1");
      expect(user.userId).to.equal("user1");
      user.should.have.property("pubKey");
    });

    it("- getResourceOwner('fileThatDoesNotExist'): should raise an error and the promise rejected", async () => {  
      wrapper.getResourceOwner("fileThatDoesNotExist").should.eventually.be.rejectedWith("Resource does not exist");
    });

    describe("# Util: utility functions", ()=> {
      it("getIdentifier should get the correct identifier 'user1' from example 'resource:tech.hypervault.User#user1'", async () => {  
        expect(wrapper.util.getIdentifier("resource:tech.hypervault.User#user1")).to.equal("user1");
      });

      it("for special case 'resource:tech.hypervault.User#user##2' getIdentifier should still work", async () => {  
        expect(wrapper.util.getIdentifier("resource:tech.hypervault.User#user##2")).to.equal("user##2");        
      });
    });
  });

  describe("# fileUtils", () => {
    it("should give the correct hash (...47a2) of the file _testFile.txt", () => {  
      expect(fileUtils.hashFile("./_testFile.txt")).to.equal("b1549ed4c79125e9d2e6fd38b00eeca6c0d88cce7e2f7ff3e5da0c49b3c247a2");
    });
  });

  describe("# server.js endpoints at /api/", () => {
    describe("/ : API root", () => {
      it("should ping the network successfully", async () => {  
        res = await chai.request(server).get("/api/").send();
        expect(res.body).to.have.property("version");
      });
    });

    describe("/upload", () => {
      before(async () => {
        try {
          await wrapper.devOnly.putResource("b1549ed4c79125e9d2e6fd38b00eeca6c0d88cce7e2f7ff3e5da0c49b3c247a2", "PENDING_TRANSFER");
        } catch(e) {
          throw e;
        }
      });

      it("should return 400 when no file is attached but a resourceId is valid", async () => {  
        const res = await chai.request(server).post("/api/upload/b1549ed4c79125e9d2e6fd38b00eeca6c0d88cce7e2f7ff3e5da0c49b3c247a2");
        res.status.should.equal(400);
        res.text.should.equal("One and only one attached file is required. ");
      });

      it("should return 404 when resource does not exist", async () => {  
        const res = await chai.request(server).post("/api/upload/fileThatDoesNotExist")
          .attach("resource",  fs.readFileSync('./package.json'), "testfile");
        expect(res.status).to.equal(404);
      });

      it("should return 400 when file hash does not match resourceId", async () => {  
        const res = await chai.request(server).post("/api/upload/b1549ed4c79125e9d2e6fd38b00eeca6c0d88cce7e2f7ff3e5da0c49b3c247a2")
          .attach("resource",  fs.readFileSync('./package.json'), "testfile");
        res.status.should.equal(400);
        res.text.should.equal("The filehash does not match the resourceId. ");
      });

      it("should return 201 when the file is successfully uploaded", async () => {  
        const res = await chai.request(server).post("/api/upload/b1549ed4c79125e9d2e6fd38b00eeca6c0d88cce7e2f7ff3e5da0c49b3c247a2")
          .attach("resource",  fs.readFileSync('./_testFile.txt'), "_testFile.txt");
        res.status.should.equal(201);
        res.text.should.equal("b1549ed4c79125e9d2e6fd38b00eeca6c0d88cce7e2f7ff3e5da0c49b3c247a2");
      });
    });
  });
});