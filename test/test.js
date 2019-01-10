const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiAsPromised = require("chai-as-promised");
 
const should = chai.should();
const expect = chai.expect;
chai.use(chaiAsPromised);
chai.use(chaiHttp);

const wrapper = require("../controllers/wrapper");
const fileUtils = require("../controllers/fileUtils");
const cryptoUtil = require("../controllers/cryptoUtils");
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

    it("- verifyPendingRequest: null is returned if request does not exist", async () => {  
      const isValid = await wrapper.verifyPendingRequest("requestThatDoesNotExist");
      expect(isValid).to.be.null;
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

  describe("# cryptoUtils", ()=> {
    const signature = "30440220730e35a73040fe27412a951c5ffe9d5a430c4c8a2ced97b98737b1a219786b8f0220255ee1f808cebe55cb063bda43973143c2a768350bece2e5dbe360fd4a3f6ba1";
    it("should verify the signature correctly for user1.pub", () => {  
      const pubKey = fs.readFileSync("./test/user1.pub");
      expect(cryptoUtil.verifySignature("test", pubKey, signature) ).to.equal(true);
    });

    it("signature verification should fail if the specified data is incorrect", () => {  
      const pubKey = fs.readFileSync("./test/user1.pub");
      expect(cryptoUtil.verifySignature("test2", pubKey, signature) ).to.equal(false);
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

    describe("/download", ()=> {
      async function beforeAndAfter () {
        try {
          // reset request status
          await wrapper.devOnly.putRequest("3cb701d51dc94495dbdb25c614232757e8964dd9164457be830fc80f2dbebb75", "PENDING");
        } catch (e) {
          throw e;
        }
      }

      before(beforeAndAfter);

      it("should return 404 for requests that do not exist", async () => {  
        const res = await chai.request(server).get("/api/download/requestThatDoesNotExist");
        res.status.should.equal(404);
      });

      // it("should return 202 for a request with correct signature and the request becomes FULFILLED, subsequent request will be rejected with 400", async () => {  
      //   const signature = "30450221009d3ad15114f03382edfa0f3050f53fd609e400b0b10469d41b96e8682598b7f7022019178f7a3e570f91819e4da145c65657e30909a34491e97f59caa91735a768ba";
      //   const transactionId = "3cb701d51dc94495dbdb25c614232757e8964dd9164457be830fc80f2dbebb75";
        
      //   const res = await chai.request(server).get(`/api/download/${transactionId}/${signature}`);
      //   res.status.should.equal(202);

      //   const pReq = await wrapper.getRequest(`${transactionId}`);
      //   expect(pReq.status).to.equal("FULFILLED");

      //   const res2 = await chai.request(server).get(`/api/download/${transactionId}/${signature}`);
      //   res2.status.should.equal(400);
      // });

      after(beforeAndAfter);
    });
  });
});