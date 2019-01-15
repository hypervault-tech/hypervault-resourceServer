# Hypervault resource server

## Bringing up the resource server

Simply run ` npm start `. But please check that everthing is up and running by running the following commands after a few seconds: 

```
docker logs hypervaultrest
```

which should hopefully show something like

```
...
Web server listening at: http://localhost:3000
Browse your REST API at http://localhost:3000/explorer
```

and also run 

```
forever list | grep resourceServer
```

which should hopefully show an instance that is up and running like this 

```
data:    [0] resourceServer /home/ubuntu/.nvm/versions/node/v8.15.0/bin/node server.js 1768    1774    /home/ubuntu/.forever/resourceServer.log 0:0:0:21.928
```

## Setting up an Ubuntu server

Download and install prerequisites by running as NON-ROOT

```
curl -O https://hyperledger.github.io/composer/latest/prereqs-ubuntu.sh

chmod u+x prereqs-ubuntu.sh

./prereqs-ubuntu.sh
```

All hypervault projects use node `v8.9.4` so use nvm to install and change into `8.9.4` and upgrade npm to latest version:

```
nvm install 8.9.4
nvm use 8.9.4
npm install -g npm
```

Then install composer tools

```
npm install -g composer-cli
npm install -g composer-rest-server
npm install -g composer-playground
```

Next import the identity card `resourceServer.card` by running 

```
composer card import -f resourceServer.card
```

Now test if the connection is successful by 

```
composer network ping --card resourceServer@hypervault
```

Finally start the REST server by 

```
composer-rest-server -c resourceServer@hypervault
```

## Troubleshooting

If for some reason you face the following error message

```
Error: Failed to load connector module "composer-connector-hlfv1" for connection type "hlfv1". The gRPC binary module was not installed. This may be fixed by running "npm rebuild"
```

simply go into the directory where `composer-cli` is installed and rebuild using 

```
npm rebuild --unsafe-perm
```

See https://github.com/hyperledger/composer/issues/1531#issuecomment-315502935