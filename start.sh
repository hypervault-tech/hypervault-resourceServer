#!/usr/bin/env bash
set -e 

echo "Getting latest business network card from hypervault-id repository"
set +e 
rm resourceServer1.card
composer card delete -c resourceServer1@hypervault
set -e 
wget https://github.com/lixiii/hypervault-id/raw/master/cards/resourceServer1.card
composer card import -f resourceServer1.card
rm resourceServer1.card

echo "Building and running hypervault-rest-server"
cd ./composer-rest-server
source ./start.sh 

cd ../
echo "Restarting resource server"
set +e 
pm2 stop resourceServer 
set -e 
pm2 start server.js --name="resourceServer" 

echo "Check server status by running: "
echo "pm2 list"