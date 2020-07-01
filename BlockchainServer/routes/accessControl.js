const express = require("express");
const router = express.Router();
const upload = require("express-fileupload");
const auth = require("../utilities/auth")
const projectAuth = require("../utilities/projectAuth");
const ipfsUrls = require("../utilities/ipfsUrls");
const getIpfsInputs = require("../utilities/getIpfsInputs");
const {readops} = require("../utilities/checkAccess");
const axios = require("axios");
const errorHandle = require("../utilities/errorHandling");
const updateHash = require("../utilities/updateHash");
const deleteProj = require("../utilities/deleteProject")
router.use(upload());
router.post('/',auth,async (req,res)=>{
try{
    
    const {access,accessobj,mynetwork,factory} = await projectAuth(req.cardName,req.body.projectid,req.body.operation);
        let projectid,operation,commitHash;
     
        if(req.files!=undefined){
            req.body["filebuff"] =  Buffer.from(req.files.file.data,'utf8');
        }
            projectid = req.body.projectid;
            operation = req.body.operation;
            
        if(req.body.commitHash!=undefined&&operation!="GETFILES"){
           if(req.body.commitHash!='undefined') {
            return res.status(400).send("Cannot Perform Commit Operation. Please Checkout to a branch")
           }
            
        }
                let cliops = ['PUSH','PULL','FETCH','CLONE'];

                if(cliops.includes(operation)){
                    console.log("Performing A CLI Operation")
                    accessobj.access = access;
                    return res.status(200).send(accessobj);
            }else{
                if(!access){
                    return res.status(401).send('Access Denied')
                }
                let token = req.header("x-auth-token");
                    let responseType = null;
                    let url = ipfsUrls[operation]               
                    let inputs = getIpfsInputs(operation,accessobj,req.body);
                    let buuferops = ["DOWNLOADREPO","DOWNLOADFORCLI"]
                    if(buuferops.includes(operation)){
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
                try{  
                    if(operation=="DELETEPROJ"){
                        await deleteProj(mynetwork,factory,projectid);
                    }

                 const response = await axios.post(url,inputs,config);
                    let readoperations = [...readops,"DELETEPROJ"];

                    if(!readoperations.includes(operation)){
                        await updateHash(mynetwork,factory,projectid,response.data.majorHash);
                        mynetwork.disconnect();
                    }else{
                        mynetwork.disconnect();
                    }
                    return res.status(200).send(response.data)   
                }catch(error){
                    mynetwork.disconnect();
                    console.log(error.response.data)
                   return res.status(400).send(error.response.data)
                   
                }   
 
            } 
    }catch(error){
        return res.status(400).send(error)
    }              
    
})
module.exports = router
