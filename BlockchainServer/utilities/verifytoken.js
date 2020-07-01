const jwt = require("jsonwebtoken");
const config = require("config");
module.exports = function (token){
    if(!token)throw 'Access denied.No token provided.';
    try{
        const decoded = jwt.verify(token,config.get("jwtPrivateKey"));
         return decoded.cardName;
       
    }catch(ex){
        throw 'Invalid token';
    }

}