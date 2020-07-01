const ipfsClient = require('ipfs-http-client');
const config = require('config');
const ipfsHost = config.get("ipfsdaemon");
const ipfs = ipfsClient(ipfsHost, '5001');

module.exports = ipfs;