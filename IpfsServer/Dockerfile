FROM ubuntu:18.04

ENV USER=ipfsuser06
ENV UID=12345
ENV GID=23456

RUN groupadd -g "$GID" ipfsuser 
RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/home/ipfsuser06" \
    --uid "$UID" \
    --ingroup ipfsuser \
    "$USER"

RUN apt-get update --fix-missing -y && apt-get upgrade -y 
RUN apt-get install -y build-essential bash git curl

# 1. Setting user will make all further RUN, CMD, ENTRYPOINT commands to execute under this user:
USER ipfsuser06 

# 2. Creating folder for storing all ipfs server files under home directory of this user.
RUN mkdir /home/ipfsuser06/ipfsServer

# 3. set working directory
WORKDIR /home/ipfsuser06/ipfsServer
    
# install and cache app dependencies
COPY --chown=ipfsuser06:ipfsuser . .

RUN curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash
RUN export NVM_DIR="$HOME/.nvm" && \
    [ -s"$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"  && \
    [ -s"$NVM_DIR/bash_completion" ] && . "$NVM_DIR/bash_completion" && \
    nvm install 12.16.2 && npm install

# Bring in and extract directly (that's what 'ADD' can do) 
ADD go-ipfs_v0.6.0_linux-amd64.tar.gz .
# Going to install IPFS command now..
# I needed root and I did not want to perform previous steps again so I am going to switch between users using "USER" instruction
USER root
# Switching to root because "install.sh" requires root permissions and I'm not going to put "sudo" package above in list of packages due to the previously told reason (don't want rebuilding and eventually 'npm install').
RUN cd go-ipfs && chmod +x ./install.sh && \
    ./install.sh

# Switched back
USER ipfsuser06

RUN  ipfs init
# Changing IPs to 0.0.0.0 so that it supports all requests.. (potentially insecure)
RUN ipfs config Addresses.API /ip4/0.0.0.0/tcp/5001     \
    && ipfs config Datastore.GCPeriod 30m \
    && ipfs config Addresses.Gateway /ip4/0.0.0.0/tcp/8080     \
    && ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '[         "http://localhost:3000", "http://127.0.0.1:3000", "http://0.0.0.0:3000", "http://127.0.0.1:8080", "http://0.0.0.0:8080",         "http://127.0.0.1:9095", "http://0.0.0.0:9095", "http://127.0.0.1:9094", "http://0.0.0.0:9094", "http://0.0.0.0:9096",         "http://127.0.0.1:5001", "http://0.0.0.0:5001", "http://localhost:5001", "http://localhost:5002",  "http://0.0.0.0:5002",         "http://127.0.0.1:5002", "*"     ]'     \
    && ipfs config --json Gateway.HTTPHeaders.Access-Control-Allow-Origin '[         "http://localhost:3000", "http://127.0.0.1:3000", "http://0.0.0.0:3000", "http://127.0.0.1:8080", "http://0.0.0.0:8080",         "http://127.0.0.1:9095", "http://0.0.0.0:9095", "http://127.0.0.1:9094", "http://0.0.0.0:9094", "http://0.0.0.0:9096",         "http://127.0.0.1:5001", "http://0.0.0.0:5001", "http://localhost:5001", "http://localhost:5002",  "http://0.0.0.0:5002",         "http://127.0.0.1:5002", "*"     ]'     \
    && ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '[ "GET", "PUT", "POST"  ]'     \
    && ipfs config --json Gateway.HTTPHeaders.Access-Control-Allow-Methods '[ "GET", "PUT", "POST"  ]'     \
    && ipfs config --json API.HTTPHeaders.Access-Control-Allow-Headers '[ "X-Requested-With","Range","User-Agent"]'     \
    && ipfs config --json Gateway.HTTPHeaders.Access-Control-Allow-Headers '[ "X-Requested-With","Range","User-Agent"]'

# # expose IPFS server port
EXPOSE 7005 5000
# add `/ipfsServer/node_modules/.bin` to $PATH
ENV PATH /home/ipfsuser06/ipfsServer/node_modules/.bin:$PATH
ARG JWTPRIVKEY
ENV devopschain_jwtPrivateKey $JWTPRIVKEY

# Need root user for installing Tini
USER root
# Add Tini
ENV TINI_VERSION v0.19.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
RUN chmod +x /tini
ENTRYPOINT ["/tini", "-s", "--"]

# Switching back to normal user
USER ipfsuser06
# Run your program under Tini
CMD export NVM_DIR="$HOME/.nvm" && \
    [ -s"$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"  && \
    [ -s"$NVM_DIR/bash_completion" ] && . "$NVM_DIR/bash_completion" && \
    nvm use 12 && node index.js
