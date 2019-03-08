#!/usr/bin/env bash

# Alice's private key:      4e3e61c56d4d0e88480d3ef8f817072fd3cff3a85df81e44cba7a5bf5e6d67db
# Alice's public key:       02107774e88d295bf5430ab16e0405696f56f802767111de30a6e8801c8d7bb699
# Alice's signing key:      0baaf357f36273abc2577c1d88911e04a998c79e930ebf84f41e3b0ddcd4bc6e
# Alice's verifying key:    03a9854f50a63b3435263f2585e15c82edb8be3768670352a582fe66177b3d1603

# Bob's private key:        d9efd65f7eab81c301cb4885100fa9bd4b7da81cb253d8489dabceb3c9d078d8
# Bob's public key:         03a751acfdb280ba36b9406c60cca1a9d985ecaaccc9e3d4234fa2ada1280f7e48

# File name: b1549ed4c79125e9d2e6fd38b00eeca6c0d88cce7e2f7ff3e5da0c49b3c247a2


python3 pythonScripts/encrypt.py 02107774e88d295bf5430ab16e0405696f56f802767111de30a6e8801c8d7bb699  b1549ed4c79125e9d2e6fd38b00eeca6c0d88cce7e2f7ff3e5da0c49b3c247a2 

python3 pythonScripts/directDecrypt.py 4e3e61c56d4d0e88480d3ef8f817072fd3cff3a85df81e44cba7a5bf5e6d67db b1549ed4c79125e9d2e6fd38b00eeca6c0d88cce7e2f7ff3e5da0c49b3c247a2

python3 pythonScripts/generateKfrags.py 4e3e61c56d4d0e88480d3ef8f817072fd3cff3a85df81e44cba7a5bf5e6d67db 0baaf357f36273abc2577c1d88911e04a998c79e930ebf84f41e3b0ddcd4bc6e 03a751acfdb280ba36b9406c60cca1a9d985ecaaccc9e3d4234fa2ada1280f7e48 b1549ed4c79125e9d2e6fd38b00eeca6c0d88cce7e2f7ff3e5da0c49b3c247a2 1 1

python3 pythonScripts/reencrypt.py 02107774e88d295bf5430ab16e0405696f56f802767111de30a6e8801c8d7bb699 d9efd65f7eab81c301cb4885100fa9bd4b7da81cb253d8489dabceb3c9d078d8 03a9854f50a63b3435263f2585e15c82edb8be3768670352a582fe66177b3d1603 b1549ed4c79125e9d2e6fd38b00eeca6c0d88cce7e2f7ff3e5da0c49b3c247a2