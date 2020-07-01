# 27MB baseimage - alpine FTW
FROM node:12.16.3-alpine3.11 
# After picking a base image, set the working directory.
WORKDIR /webserver
# Copy the index.js & package.json file from the same directory where this Dockerfile resides at.
COPY build build
COPY webserver .
# Set up node_modules
RUN node -v
RUN yarn cache clean
RUN yarn config set ignore-engines true
RUN yarn install --network-timeout 1000000

# Start Web server
EXPOSE 8080

# Add Tini
RUN apk add --no-cache tini
# Tini is now available at /sbin/tini
ENTRYPOINT ["/sbin/tini", "-s", "--"]

CMD ["node", "index.js"]
