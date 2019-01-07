#!/usr/bin/env bash

echo "Building and running hypervault-rest-server"
cd ./composer-rest-server
source ./start.sh 

cd ../
echo "Restarting resource server"
forever stop resourceServer
forever start --append --uid "resourceServer" server.js

echo "Check server log by running: "
echo "forever list | grep resourceServer"