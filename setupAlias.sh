#!/bin/bash
ALIASES='
alias restart="pm2 stop resourceServer && pm2 start server.js --name="resourceServer""
alias gp="git pull"
alias ccrest="composer-rest-server -c resourceServer@hypervault -n always -u true"'

echo "Setting up the following aliases"
echo "$ALIASES"
echo "$ALIASES" > ~/.bash_aliases
