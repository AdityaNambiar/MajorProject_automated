const axios = require("axios");
const config = require("config")
module.exports = (token,projectid,operation)=>{
    return new Promise(async (resolve,reject)=>{
    try{
        let body  = {
            projectid:projectid,
            operation:operation
        }
        let authserver = config.get("authserver");
       const {data} =  await axios.post(`${authserver}/checkAccess`,body,{
           headers:{
               "x-auth-token":token
           }
       });
       
       let access = data.access;
        return resolve(access)
    }catch(error){
        return reject(error)

    }

    });
    

}