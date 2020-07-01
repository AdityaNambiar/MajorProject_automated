#! /bin/bash

# Set up node version:

echo "Switching to Node v8 & Starting to setup composer"
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

nvm use 8.9.4;
if [ ! -d node_modules/ ] # True if there's no 'directory' (-d) called 'node_modules/' 
then
	npm i;
fi

docker ps -a | grep -q -E "hyperledger/|dev-peer"; # -E = for using extended REGEX with grep (POSIX standard)
if [ $? -ne 0 ] # Exit code returned non-zero ('1' on my shell) if it doesn't find any containers
then
    ./setupFabric.sh;
else # Exit code returned 0 means there were some hyperledger containers
    docker start $(docker ps -a | grep -E "hyperledger/|dev-peer" | awk '{ print $1 }');
fi

echo "Hyperledger Fabric containers are now running!"

read -p "Press any key to return back to command line" -n1 something;
echo 

echo "If you wish to use hyperledger composer cli, type 'nvm use 8' to switch your bash environment to Node v8.";
exec bash;