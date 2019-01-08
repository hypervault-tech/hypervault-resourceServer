#!/usr/bin/env bash

echo "Getting latest business network card from hypervault-id repository"
rm resourceServer1.card
composer card delete -c resourceServer1@hypervault
wget https://github.com/lixiii/hypervault-id/raw/master/cards/resourceServer1.card
composer card import -f resourceServer1.card
rm resourceServer1.card

echo "Building and running hypervault-rest-server"
cd ./composer-rest-server
source ./start.sh 

cd ../
echo "Restarting resource server"
pm2 stop resourceServer 
pm2 start server.js --name="resourceServer" 

echo "Check server status by running: "
echo "pm2 list"