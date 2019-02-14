#!/usr/bin/env bash

echo "Getting latest business network card from hypervault-id repository"
rm resourceServer.card
composer card delete -c resourceServer@hypervault
wget https://github.com/lixiii/hypervault-id/raw/master/cards/resourceServer.card
composer card import -f resourceServer.card -c resourceServer@hypervault
rm resourceServer.card

echo "Building and running hypervault-rest-server"
cd ./composer-rest-server
source ./start.sh 

cd ../
echo "Restarting resource server"
pm2 stop resourceServer 
pm2 start server.js --name="resourceServer" 

echo "Check server status by running: "
echo "pm2 list"

# Update reverse proxy
echo 
echo '---------------------------------------'
echo "Updating reverse proxy"
echo '---------------------------------------'
sudo cp ./resourceserver.hypervault.tech.conf /etc/nginx/conf.d/resourceserver.hypervault.tech.conf
sudo systemctl restart nginx