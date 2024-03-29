#!/usr/bin/env bash
# set -x #print all commands

docker kill hypervaultrest
docker rm hypervaultrest

echo "Building the docker container"
docker build -t hypervault/rest-server .
source .env

docker run \
-d \
-e COMPOSER_CARD=${COMPOSER_CARD} \
-e COMPOSER_NAMESPACES=${COMPOSER_NAMESPACES} \
-e COMPOSER_AUTHENTICATION=${COMPOSER_AUTHENTICATION} \
-e COMPOSER_MULTIUSER=${COMPOSER_MULTIUSER} \
-v ~/.composer:/home/composer/.composer \
--name hypervaultrest \
-p 3000:3000 \
hypervault/rest-server

echo "Server should now be listening on port 3000"
echo "Run the following to see the docker logs. "
echo "docker logs hypervaultrest"