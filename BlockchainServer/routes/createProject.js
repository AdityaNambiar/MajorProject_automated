const config = require('config');
const processEvents = require('../utilities/processEvents');
let networkname = config.get('networkname');
const namespace = `org.${networkname}.asset`;
const transactionType = "createProject";
const MyNetwork = require('../utilities/MyNetwork');
const express = require('express');
const auth = require('../utilities/auth');
const updateHash = require('../utilities/updateHash');
const getIpfsServer = require("../api/ipfsServer");
const errorHandle = require("../utilities/errorHandling");
const router = express.Router();

router.post('/',auth,async(req,res)=>{
    const mynetwork = new MyNetwork(req.cardName);
    try{

        await mynetwork.connect();
        let bnDef = mynetwork.connection.getBusinessNetwork();
        console.log("2. Received Definition from Runtime: ",bnDef.getName(),bnDef.getVersion());
        
        let factory  = bnDef.getFactory();
        let options = {
            generate:false,
           includeOptionalFields:false
        }
        //Setting the transaction variables
        let projectid = req.body.projectid.split(" ").join("");
        let description = req.body.description; 
        let private = req.body.private;
        //Creating the Transaction
        let transaction = factory.newTransaction(namespace,transactionType,projectid,options);
    
        transaction.setPropertyValue("projectid",projectid);
        transaction.setPropertyValue("description",description);
        transaction.setPropertyValue("private",private);
       
        processEvents(mynetwork,async (response)=>{
            
            //Code to connect to ipfs Server
            let pregistry = await mynetwork.connection.getParticipantRegistry(`org.devopschain.participant.${req.pType}`);
            // let splituser = req.pIdentifier.split('$'); 
            const uname = req.pIdentifier;
            let participant = await pregistry.get(req.pIdentifier);
            const ipfsServer = getIpfsServer(req.header('x-auth-token'));
           
            let body = {
                projName:projectid,  
                username:uname,
                authoremail:participant.emailid,
                authorname:uname,
                filebuff:description,
 
            }
            console.log(`ipfs body:${JSON.stringify(body)}`)
            const {data} = await ipfsServer.post('/initProj',body);
            await updateHash(mynetwork,factory,data.projName,data.majorHash);
            mynetwork.disconnect();
            return res.status(200).send(JSON.parse(response.project))
            
        })

        return mynetwork.connection.submitTransaction(transaction).then(res=>{
            console.log("Project created Successfully");
            
        }).catch(error=>{
            // console.log(error);
            res.status(400).send(error)
            mynetwork.disconnect();
        })
    

    }catch(error){
        // res.status(400).send(error.toString());
        return errorHandle(res,error);
    }
    
})

module.exports = router;