#!/bin/bash
ALIASES='
alias gp="git pull"
alias ccrest="composer-rest-server -c resourceServer1@hypervault -n always -u true"'

echo "Setting up the following aliases"
echo "$ALIASES"
echo "$ALIASES" > ~/.bash_aliases
