#! /bin/bash

# Running nvm command requires these three below lines:
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

endScript(){
    docker ps -a | grep -q -E "dochain-"; # -E = for using extended REGEX with grep (POSIX standard)
    if [ $? -eq 0 ]; then # Exit code returned non-zero ('1' on my shell) if it doesn't find any containers
        ./stopServices.sh -v
    fi
    echo -e "\nThank you for using the application.\n";
    trap - SIGINT SIGTERM SIGQUIT SIGTSTP # clear trap
}

# SIG = signal. Reference: https://en.wikipedia.org/wiki/Signal_(IPC)
# SIGINT (INT = 'Interrupt') = Trigged when CTRL+C is used to stop a program.
# SIGTERM (TERM = '') = Triggered when using the "kill" command to stop this script.
# SIGQUIT (QUIT = 'Quit signal') = Trigged when CTRL+\ is used
# SIGTSTP(TSTP = 'Terminal Stop' ~ Basically puts a running program as background job)= Triggered when CTRL+Z is used.
trap endScript SIGINT SIGTERM SIGQUIT SIGTSTP

help() {
    echo -e "\nMajorProject startup script v0.1";
    echo "You need to provide the following options after the script name:";
    echo -e "\t--jwt\t\t- (required) JWT Private Key (same as the one given for BlockchainServer & docker-compose under MajorProject/this directory)";
    echo -e "\t--jkurl\t\t- (required) Jenkins URL with Port (default: 127.0.0.1:8080)";
    echo -e "\t--jkuser\t- (required) Jenkins User ID (default: admin)";
    echo -e "\t--jktoken\t- (required) Jenkins API token";
    echo -e "\t--help\t\t- Display this info message";
    exit;
}

NO_JWT=true
NO_JENKINS_USER_ID=true
NO_JENKINS_URL=true
NO_JENKINS_API_TOKEN=true

# Took help from hlfv12/startFabric.sh
paramCheck() {
    local options_given=0;
    local saveoption;
    while [ $# -gt 0 ]; do
        if [[  "$1" =~ ^-- ]];
        then
            saveoption=$1;
            (( ++options_given ));
        fi
        shift
    done
    if [ $options_given -eq 1 ] && [ "$saveoption" == "--help" ]; then # If the 4 required params are not provided
        help;
    elif [ $options_given -ne 4 ]; then # If the 4 required params are not provided
        echo -e "\nYou must provide all the required parameters. Check './startProject.sh --help' (usage info) for more details!\n";
        exit;
    else    
        return;
    fi
    
}

Parse_Arguments() {
	while [ $# -gt 0 ]; do # while number of params is greater than 0
        case $1 in
			--help)
				HELPINFO=true
                break;
				;;
            --jwt)
                shift # Grab the value coming after '--jwt' 
                if [ "$1" == "" ] || [[ "$1" =~ ^--.* ]]; then
                    if [ "$devopschain_jwtPrivateKey" == "" ]; then
                        continue;
                    else
                        echo -e "\nUsing the value for JWT Private Key set earlier (find it in $HOME/.bashrc) ..."
                        NO_JWT=false
                        devopschain_jwtPrivateKey=$devopschain_jwtPrivateKey
                    fi
                else
                    NO_JWT=false
                    devopschain_jwtPrivateKey=$1
                fi
                ;;
            --jkurl)
                shift 
                if [ "$1" == "" ] || [[ "$1" =~ ^--.* ]]; then
                    if [ "$JENKINS_URL" == "" ]; then
                        JENKINS_URL=127.0.0.1:8080
                    else
                        echo -e "\nUsing the value for JENKINS_URL set earlier (find it in $HOME/.bashrc) ..."
                        NO_JENKINS_URL=false
                        JENKINS_URL=$JENKINS_URL
                    fi
                else
                    NO_JENKINS_URL=false
                    JENKINS_URL=$1
                fi
                ;;
            --jkuser)
                shift
                if [ "$1" == "" ] || [[ "$1" =~ ^--.* ]]; then
                    if [ "$JENKINS_USER_ID" == "" ]; then # If the environment variable is empty, pick default otherwise pick earlier set value
                        JENKINS_USER_ID=admin
                    else
                        echo -e "\nUsing the value for JENKINS_USER_ID set earlier (find it in $HOME/.bashrc) ..."
                        NO_JENKINS_USER_ID=false
                        JENKINS_USER_ID=$JENKINS_USER_ID
                    fi
                else
                    NO_JENKINS_USER_ID=false
                    JENKINS_USER_ID=$1
                fi
                ;;
            --jktoken)
                shift 
                if [ "$1" == "" ] || [[ "$1" =~ ^--.* ]]; then # If the value given to jktoken is either empty or if user is starting the next option by '--', break the switch case.
                    if [ "$JENKINS_API_TOKEN" == "" ]; then
                        continue;
                    else
                        echo -e "\nUsing the value for JENKINS_API_TOKEN set earlier (find it in $HOME/.bashrc) ..."
                        NO_JENKINS_API_TOKEN=false
                        JENKINS_API_TOKEN=$JENKINS_API_TOKEN
                    fi
                else
                    NO_JENKINS_API_TOKEN=false
                    JENKINS_API_TOKEN=$1
                fi
                ;;
            *)
                echo "Unknown option $1. Please refer to the usage info below.";
		esac
		if [[ "$1" =~ ^--.* ]]; then # If the value given to jktoken is either empty or if user is starting the next option by '--', don't shift and continue the switch case.
        	continue;
		else
			shift # Just like how a 'shift' would work. Used to go through params. Eg. After parsing $1, a 'shift' will make $2 param as $1 so that it can be parsed in while loop above.
		fi
	done
}

Parse_Arguments "$@" # $@ = params will be accessible in the form of array.


if [ "$HELPINFO" == true ] || [ $# -eq 0 ]; then
    help
fi

checkPrereqs() {
    # Print installation details for user
    # Check whether all mentioned prerequisites are installed or not.
    echo '';
    echo 'Please review all tools with expected versions are installed as mentioned before:'
    echo ''
    echo -n -e 'Node: '
    node --version
    echo '';
    echo -n -e 'npm: '
    npm --version
    echo '';
    echo -n -e 'Checking for node v8.9.4 & v12.16.2 (via nvm)...: \n'
    nvm ls | grep -q 8.9.4
    ret1=$?
    nvm ls | grep -q 12.16.2
    ret2=$?
    if [ $ret1 -ne 0 ] || [ $ret2 -ne 0 ]; then
        if [ $ret1 -ne 0 ]; then
            echo -e "\nnode v8.9.4 is not installed. Type 'nvm install 8.9.4' to install this node version via nvm\n"; 
        fi
        if [ $ret2 -ne 0 ]; then
            echo -e "\nnode v12.16.2 is not installed. Type 'nvm install 12.16.2' to install this node version via nvm\n"; 
        fi

    fi
    echo -n -e 'Docker (version expected - 19.03.9): '
    docker --version
    echo '';
    echo -n -e 'Docker Compose (version expected - 1.24): '
    docker-compose --version
    echo '';
    echo -n -e 'Python: '
    python -V
    echo '';
    echo -n -e 'Java (version expected - 11.0.7):\n'
    java --version
    echo '';
    echo -n -e 'Going to print Jenkins service status (expected state in green: "\e[1;92mactive\e[0m" )...: \n'
    sudo service jenkins status
    echo -e "\n\e[1;33mNOTE\e[0m: PLEASE MAKE SURE YOUR JENKINS HAS THE FOLLOWING PLUGINS INSTALLED: \n";
    echo -e "\n1. NodeJS";
    echo "2. Docker";
    echo "3. Git";
    echo "Configure their properties (paths / values) in \"Manage Jenkins > Global Tool Configuration\" as given in README ";
    echo '';

    echo -e '=======================================================================================================\n';
    read -p "Press any key to continue..." -n1 var1
    echo
}

checkPrereqs 
# --- 

if [ "$NO_JWT" == true ]; then
    echo -e "\nPlease provide a \e[4mJWT Private Key\e[0m for authentication.\n";
    exit;
fi

if [ "$NO_JENKINS_URL" == true ]; then # For bash color codes reference: https://misc.flogisoft.com/bash/tip_colors_and_formatting
    echo -e "\n\e[1;33mWARNING\e[0m: JENKINS_URL not provided. Will be using default value as '127.0.0.1:8080'.\n";
fi

if [ "$NO_JENKINS_USER_ID" == true ]; then
    echo -e "\n\e[1;33mWARNING\e[0m: JENKINS_USER_ID not provided. Will be using default value as admin.\n";
fi

if [ "$NO_JENKINS_API_TOKEN" == true ]; then
    echo -e "\nPlease provide a \e[4mJenkins API token\e[0m. \nIf you don't have it already, find it here: \n";
    echo -e "\n1. Open your Jenkins Dashboard.";
    echo "2. Click (on left) People.";
    echo "3. Click on your user ID / Name";
    echo "4. Click (on left) Configure";
    echo "5. Under 'API Token', Click 'Add new Token' to generate new token.";
	echo -e "Copy this new token and provide it to the script --jktoken param\n";
    exit;
fi

gnome-terminal -t 'Hyperledger Model' --working-directory="${PWD}/HyperledgerModel/" -- ./starthlfcomposer.sh;
gnome-terminal -t 'Blockchain Server' --working-directory="${PWD}/BlockchainServer/" -- /bin/bash -c "./startServer.sh $devopschain_jwtPrivateKey; exec bash;"
gnome-terminal -t 'CI/CD Middleware' --working-directory="${PWD}/cicdmiddleware/" -- /bin/bash -c "./startCICD.sh $devopschain_jwtPrivateKey $JENKINS_URL $JENKINS_USER_ID $JENKINS_API_TOKEN; exec bash;"
sleep 15 # Waiting some time for starthlfcomposer.sh to start/create 'composer_default' net  
gnome-terminal --window -t 'Docker containers' -- ./startServices.sh

sh -c 'echo "Press CTRL+C to exit" | cat - /dev/tty' #https://unix.stackexchange.com/a/205615
