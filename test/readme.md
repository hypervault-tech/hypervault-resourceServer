# Tests for Hypervault Resource Server 

The `test.js` contains the Mocha tests for the Resource Server project. 

The file `_testFile.txt` is a sample confidential file used to test the network. Its SHA256 has is `b1549ed4c79125e9d2e6fd38b00eeca6c0d88cce7e2f7ff3e5da0c49b3c247a2`. Two private/public key pairs are also included here. The public key files have extensions `.pub` while that of private keys have extensions `.key`. 

The private keys are generated using `openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out user1.key`. 