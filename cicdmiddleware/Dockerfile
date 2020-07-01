# base image
FROM node:12.16.2-alpine
    
# expose CI/CD server port
EXPOSE 5003

RUN apk update && apk upgrade 
RUN apk add --no-cache bash git \ 
    openssh python2 make build-base
    
ENV USER=ipfsuser06
ENV UID=1001
ENV GID=1001

RUN addgroup -g "$GID" ipfsuser
RUN adduser \
    -D \
    -g "" \
    -s /bin/bash \
    -h "/home/ipfsuser06" \
    -u "$UID" \
    -G ipfsuser \
    "$USER"

USER ipfsuser06
RUN mkdir /home/ipfsuser06/cicdmiddleware/
WORKDIR /home/ipfsuser06/cicdmiddleware/

# install and cache app dependencies
COPY . .

RUN npm install

USER root
# Install docker for the docker.sock:
RUN apk add --no-cache docker openrc iptables
RUN rc-update add docker boot

RUN mkdir /etc/docker || true
RUN touch /etc/docker/daemon.json || true
RUN echo "{\"insecure-registries\":[\"dochain-registry:5000\", \"0.0.0.0:5000\"]}" >> /etc/docker/daemon.json

RUN mkdir /etc/default || true
RUN touch /etc/default/docker
RUN echo "DOCKER_OPTS=\"--config-file=/etc/docker/daemon.json\"" >> /etc/default/docker

USER ipfsuser06
# add `/cicdmiddleware/node_modules/.bin` to $PATH
ENV PATH /cicdmiddleware/node_modules/.bin:$PATH
ARG JWTPRIVKEY
ENV devopschain_jwtPrivateKey $JWTPRIVKEY
#checking if files are root or ipfsuser:
RUN ls -al
USER root 
# Add Tini
RUN apk add --no-cache tini
# Tini is now available at /sbin/tini
ENTRYPOINT ["/sbin/tini", "-s", "--"]
USER ipfsuser06
# Run your program under Tini
# or docker run your-image /your/program ...
CMD ["node", "index.js"]
