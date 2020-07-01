#!/bin/bash

# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
# 
# http://www.apache.org/licenses/LICENSE-2.0
# 
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

echo "DO NOT run these scripts with SUDO or being a ROOT user"
# Clean the .composer card/client-data/logs folder:
rm -rf ~/.composer/cards/*; rm -rf ~/.composer/client-data/*; rm -rf ~/.composer/logs/*;
# Clean the PC of all .card files downloaded or exported by default 
# [DO NOT RUN WITH 'sudo or root permissions]:
#find /home -iname '*.card' -exec rm -rf {} \;

export FABRIC_VERSION=hlfv12

source "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"/_loader.sh

rm DevServer_connection.json
echo "Removing previous hyperledger/dev-peer (chaincode) containers to avoid possibility of conflicts (Recommended by Fabric documentation)"
cids=$(docker ps -a | grep -P 'hyperledger|dev-peer' | awk '{ print $1 }')
for id in $cids
do
	docker stop $id;
	docker rm $id;
done
if [ $? -ne 0 ]
then 
	echo "Could not remove containers. Please try this yourself and read the error: docker rm $(docker ps -aq) -f"
else
	exit;
fi
	
echo "Removing previous chaincode image and volumes to avoid possibility of conflicts (Recommended by Fabric documentation)"
docker volume prune -f
docker rmi -f $(docker images -q -f "reference=dev-*")
if [ $? -ne 0 ]
then 
	echo "Could not remove chaincode image (dev-peer...). Please try this yourself and read the error: docker rmi $(grep 'dev') -f "
else
	exit;
fi  

