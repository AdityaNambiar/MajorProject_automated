const axios = require("axios");
function getIpfsServer(token){
   return axios.create({
        baseURL: 'http://localhost:5000',
        // timeout: 1000,
        headers: {'x-auth-token': token}
    });

}



module.exports = getIpfsServer;