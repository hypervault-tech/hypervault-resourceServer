# Hypervault resource server

## Setting up an Ubuntu server

Download and install prerequisites by running as NON-ROOT

```
curl -O https://hyperledger.github.io/composer/latest/prereqs-ubuntu.sh

chmod u+x prereqs-ubuntu.sh

./prereqs-ubuntu.sh
```

Then install composer tools

```
npm install -g composer-cli@0.20 composer-rest-server@0.20  composer-playground@0.20
```