#!/bin/bash
# From hlfv12/startFabric.sh
Parse_Arguments() {
	while [ $# -gt 0 ]; do # while number of params is greater than 0
		case $1 in
			--help)
				HELPINFO=true
				;;
            --jwt)
                shift # Grab the value coming after '--jwt' 
                if [ "$1" == "" ] || [[ "$1" =~ ^--.* ]]; then
                    return;
                else
                    NO_JWT=false
                    devopschain_jwtPrivateKey=$1
                fi
                ;;
            --jkurl)
                shift 
                if [ "$1" == "" ] || [[ "$1" =~ ^--.* ]]; then
					JENKINS_URL=localhost
                else
                    NO_JENKINS_URL=false
                    JENKINS_URL=$1
                fi
                ;;
            --jkuser)
                shift
                if [ "$1" == "" ] || [[ "$1" =~ ^--.* ]]; then
                    JENKINS_USER_ID=admin
                else
                    NO_JENKINS_USER_ID=false
                    JENKINS_USER_ID=$1
                fi
                ;;
            --jktoken)
                shift
                if [ "$1" == "" ] || [[ "$1" =~ ^--.* ]]; then # If the value given to jktoken is either empty or if user is starting the next option by '--', break the switch case.
                    return;
                else
                    NO_JENKINS_API_TOKEN=false
                    JENKINS_API_TOKEN=$1
                fi
                ;;
            *)
                echo "Unknown option $1. Please refer to the usage info below.";
		esac
		if [[ "$1" =~ ^--.* ]]; then # If the value given to jktoken is either empty or if user is starting the next option by '--', break the switch case.
        	return;
		else
			shift # Just like how a 'shift' would work. Used to go through params. Eg. After parsing $1, a 'shift' will make $2 param as $1 so that it can be parsed in while loop above.
		fi
	done
}


Parse_Arguments "$@" # $@ = params will be accessible in the form of array.
echo url: $JENKINS_URL
echo userid: $JENKINS_USER_ID
echo apitoken: $JENKINS_API_TOKEN
echo jwt: $devopschain_jwtPrivateKey
echo ''
