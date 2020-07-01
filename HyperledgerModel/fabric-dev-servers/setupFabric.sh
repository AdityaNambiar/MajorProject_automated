set -e
echo "Switching to Node v8 & Starting to setup composer"
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

export FABRIC_VERSION=hlfv12

nvm use 8
docker rm -f logspout || true
#/home/username/fabric-dev-servers/startFabric.sh
./startFabric.sh
composer card delete -c PeerAdmin@hlfv1 || true
#/home/username/fabric-dev-servers/createPeerAdminCard.sh
./createPeerAdminCard.sh
composer card delete -c admin@erp || true
(mkdir dist || true) && cd dist
composer archive create -t dir -n ../
read -p "Enter bna file name & version " bna version
composer network install -a $bna@$version.bna -c PeerAdmin@hlfv1
composer network start -c PeerAdmin@hlfv1 -n $bna -V $version -A admin -S adminpw
composer card import -f admin@$bna.card -c admin@$bna
composer card list
composer network ping -c admin@$bna
