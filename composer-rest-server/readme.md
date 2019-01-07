# Hypervault REST Server for resourceServer

This is based on https://github.com/lixiii/hypervault-rest-server but adapted for use with resourceServers. 

In particular, no mondoDB containers are created and the server is run in single user mode using resourceServer1.card. 

Additionally, the server runs on port `3000` exclusively for the resource server wrapper. 