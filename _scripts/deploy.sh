#!/usr/bin/env bash
# This script is run on the target server over SSH by the NPM script. 
set -e # exit on error
echo 
echo '---------------------------------------'
echo "Deploying hypervault-resourceServer to server"
echo '---------------------------------------'
cd hypervault-resouceServer
git pull
set +e
npm i
pm2 stop resourceServer
set -e
pm2 start server.js --name="resourceServer"

# Update reverse proxy
echo 
echo '---------------------------------------'
echo "Updating reverse proxy"
echo '---------------------------------------'
sudo cp ./resourceserver2.hypervault.tech.conf /etc/nginx/conf.d/resourceserver2.hypervault.tech.conf
sudo systemctl restart nginx