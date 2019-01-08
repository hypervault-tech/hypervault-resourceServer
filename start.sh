#!/usr/bin/env bash
set -e 

echo "Getting latest business network card from hypervault-id repository"
wget https://github.com/lixiii/hypervault-id/raw/master/cards/resourceServer1.card
composer card delete -c resourceServer1@hypervault
composer card import -f resourceServer1.card
rm resourceServer1.card

echo "Building and running hypervault-rest-server"
cd ./composer-rest-server
source ./start.sh 

cd ../
echo "Restarting resource server"
set +e 
forever stop resourceServer 
set -e 
forever start --append --uid "resourceServer" server.js

echo "Check server log by running: "
echo "forever list | grep resourceServer"