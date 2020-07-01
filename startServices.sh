# Change the subnet to your own network's subnet (this subnet is based on Aditya's jiofi's IP)
docker network create -d bridge --subnet 192.168.0.0/16 --gateway 192.168.0.1 mjrprojnet
DOCKER_GATEWAYIP=$(ip addr show | grep "\binet\b.*\bdocker0\b" | awk '{print $2}' | cut -d '/' -f 1)
#echo "Going to set this as authserver IP (docker gateway on your machine): $DOCKER_GATEWAYIP"
docker-compose up

