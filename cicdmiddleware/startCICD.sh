# Set up node version:

echo "Switching to Node v12 & Starting to setup CI/CD server"
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

nvm use 12.16.2;

help() {
	echo "This script accepts the following parameters:"
	echo "1st param - JWT Private Key (same as the one given for BlockchainServer & docker-compose under MajorProject/)";
	echo "2nd param - Jenkins URL (with Port ~ default 8080)";
	echo "3rd param - Jenkins User";
	echo "4th param - Jenkins API token";
	echo "Example: ./startCICD.sh 12345 127.0.0.1:8080 admin aabcdefgh1234567890";
	exit;
}

if [ $# -eq 0 ]; then
	help
fi

export devopschain_jwtPrivateKey=$1;
export JENKINS_URL=$2;
export JENKINS_USER_ID=$3;
export JENKINS_API_TOKEN=$4;

# Adding JWT Private Key to bashrc (I believe this is required to allow user to execute this script alone from different terminal such that the key is loaded up automatically.)
# Setting JWT Key:
if [ ! "$1" == "" ]
then
	grep -q "export devopschain_jwtPrivateKey=" $HOME/.bashrc
	if [ $? -ne 0 ]; then
		echo "Adding JWT Private Key in environment..."
		echo -e "\nexport devopschain_jwtPrivateKey=$1" >> $HOME/.bashrc
		source $HOME/.bashrc
	else
		echo "Updating JWT Private Key in environment..."
		sed -i "s/export devopschain_jwtPrivateKey=.*/export devopschain_jwtPrivateKey=$1/" $HOME/.bashrc
		source $HOME/.bashrc
	fi
else
	echo "Please provide a JWT Private Key - same as the one you gave in the docker-compose file"
	help
fi

# Setting jenkins url:
if [ ! "$2" == "" ]
then
	grep -q "export JENKINS_URL=" $HOME/.bashrc
	if [ $? -ne 0 ]; then
		echo "Adding JENKINS_URL in environment..."
		echo -e "\nexport JENKINS_URL=$2" >> $HOME/.bashrc
		source ~/.bashrc
	else
		echo "Updating JENKINS_URL in environment..."
		sed -i "s/export JENKINS_URL=.*/export JENKINS_URL=$2/" $HOME/.bashrc
		source ~/.bashrc
	fi
else
	# If JENKINS_URL is not present in .bashrc then add it (in this case, add the default value)
	grep -q "export JENKINS_URL=" $HOME/.bashrc
	if [ $? -ne 0 ]; then # True if not present
		echo "Setting value of JENKINS_URL to the default, i.e. '127.0.0.1:8080'";
		echo -e "\nexport JENKINS_URL=127.0.0.1:8080" >> $HOME/.bashrc
		source ~/.bashrc
	fi
fi

# Setting jenkins user ID:
if [ ! "$3" == "" ]
then
	grep -q "export JENKINS_USER_ID=" $HOME/.bashrc
	if [ $? -ne 0 ]; then
		echo "Adding JENKINS_USER_ID in environment..."
		echo -e "\nexport JENKINS_USER_ID=$3" >> $HOME/.bashrc
		source ~/.bashrc
	else
		echo "Updating JENKINS_USER_ID in environment..."
		sed -i "s/export JENKINS_USER_ID=.*/export JENKINS_USER_ID=$3/" $HOME/.bashrc
		source ~/.bashrc
	fi
else
	# If JENKINS_USER_ID is not present in .bashrc then add it (in this case, add the default value)
	grep -q "export JENKINS_USER_ID=" $HOME/.bashrc
	if [ $? -ne 0 ]; then # True if not present
		echo "Setting value of JENKINS_USER_ID to the default, i.e. 'admin'";
		echo -e "\nexport JENKINS_USER_ID=admin" >> $HOME/.bashrc
		source ~/.bashrc
	fi
fi

# Setting jenkins user API token:
if [ ! "$4" = "" ]
then
	grep -q "export JENKINS_API_TOKEN=" $HOME/.bashrc
	if [ $? -ne 0 ]; then
		echo "Adding JENKINS_API_TOKEN in environment..."
		echo -e "\nexport JENKINS_API_TOKEN=$4" >> $HOME/.bashrc
		source ~/.bashrc
	else
		echo "Updating JENKINS_API_TOKEN in environment..."
		sed -i "s/export JENKINS_API_TOKEN=.*/export JENKINS_API_TOKEN=$4/" $HOME/.bashrc
		source ~/.bashrc
	fi
else
    echo -e "Please provide a Jenkins API token. \nIf you don't have it already, find it here: \n";
    echo "1. Open your Jenkins Dashboard.";
    echo "2. Click (on left) People.";
    echo "3. Click on your user ID / Name";
    echo "4. Click (on left) Configure";
    echo "5. Under 'API Token', Click 'Add new Token' to generate new token.";
	echo -e "Copy this new token and provide it to the script\n";
	help
fi

if [ ! -d node_modules/ ]
then
	npm i
fi
node index.js
