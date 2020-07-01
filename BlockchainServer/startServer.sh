# Set up node version:

echo "Switching to Node v8 & Starting to setup blockchain server"
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

nvm use 8.9.4;

export devopschain_jwtPrivateKey=$1 # This variable has to be written with "export" otherwise Node's config module won't be able to pick it up.

# Adding JWT Private Key to bashrc 
# (I believe this is required to allow user to execute this script alone 
# from different terminal such that the key is loaded up automatically.)
grep "export devopschain_jwtPrivateKey=" $HOME/.bashrc;
if [ $? -ne 0 ]; then
	echo "Adding JWT Private Key in environment..."
	echo -e "\nexport devopschain_jwtPrivateKey=$1" >> $HOME/.bashrc
	source $HOME/.bashrc
else
	echo "Updating JWT Private Key in environment..."
	sed -i "s/export devopschain_jwtPrivateKey=.*/export devopschain_jwtPrivateKey=$1/" $HOME/.bashrc
	source $HOME/.bashrc
fi

if [ ! -d node_modules/ ]
then
	npm i
fi
node index.js
