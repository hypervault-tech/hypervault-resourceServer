#!/usr/bin/env bash
python3 pythonScripts/encrypt.py 4e3e61c56d4d0e88480d3ef8f817072fd3cff3a85df81e44cba7a5bf5e6d67db 0baaf357f36273abc2577c1d88911e04a998c79e930ebf84f41e3b0ddcd4bc6e b1549ed4c79125e9d2e6fd38b00eeca6c0d88cce7e2f7ff3e5da0c49b3c247a2 

python3 pythonScripts/directDecrypt.py 4e3e61c56d4d0e88480d3ef8f817072fd3cff3a85df81e44cba7a5bf5e6d67db b1549ed4c79125e9d2e6fd38b00eeca6c0d88cce7e2f7ff3e5da0c49b3c247a2

python3 pythonScripts/generateKfrags.py 4e3e61c56d4d0e88480d3ef8f817072fd3cff3a85df81e44cba7a5bf5e6d67db 0baaf357f36273abc2577c1d88911e04a998c79e930ebf84f41e3b0ddcd4bc6e 03a751acfdb280ba36b9406c60cca1a9d985ecaaccc9e3d4234fa2ada1280f7e48 b1549ed4c79125e9d2e6fd38b00eeca6c0d88cce7e2f7ff3e5da0c49b3c247a2 1 1