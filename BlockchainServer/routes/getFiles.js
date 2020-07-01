const express = require("express");
const router = express.Router();
const upload = require("express-fileupload");
const auth = require("../utilities/auth")
const projectAuth = require("../utilities/projectAuth");
const ipfsUrls = require("../utilities/ipfsUrls");
const getIpfsInputs = require("../utilities/getIpfsInputs");
const {readops} = require("../utilities/checkAccess");
const axios = require("axios");
router.use(upload());
router.post('/',auth,async (req,res)=>{

    const {access,accessobj} = await projectAuth(req.cardName,req.body.projectid);
    if(access){

        let projectid,operation,commitHash;
        if(req.files!=undefined){
            req.body["filebuff"] =  Buffer.from(req.files.file.data,'utf8');
        }
            projectid = req.body.projectid;
            operation = req.body.operation;
            // commitHash = req.body.commitHash;
        
        if(commitHash!=undefined&&operation!="GETFILES"){
           if(commitHash!='undefined') {
            return res.status(400).send("Cannot Perform Commit Operation. Please Checkout to a branch")
           }
            
        }
                    let token = req.header("x-auth-token");
                    let responseType = null;
                    let url = ipfsUrls[operation]               
                    let inputs = getIpfsInputs(operation,accessobj,req.body);
   
                    if(readops.includes(operation)){
                        responseType = "arraybuffer"
                    }else{
                        responseType = "json"
                    }
                    let config = {
                        responseType:responseType,
                        headers:{'x-auth-token':token,
                            "Content-Type":"application/json"
                        },
                    
                     }
                   
                 const response = await axios.post(url,inputs,config);
                 return res.status(200).send(response.data)    

    }
})
module.exports = router
