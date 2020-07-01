const config = require('config');
const processEvents = require('../utilities/processEvents');
let networkname = config.get('networkname');
const namespace = `org.${networkname}.asset`;
const transactionType = "deleteProject";
const MyNetwork = require('../utilities/MyNetwork');
const express = require('express');
const auth = require('../utilities/auth');
const errorHandle = require("../utilities/errorHandling");
const ipfsServer = require("../api/ipfsServer");
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
        let projectid = req.body.projectid;
       
        //Creating the Transaction
        let transaction = factory.newTransaction(namespace,transactionType,projectid,options);
    
        transaction.setPropertyValue("projectid",projectid);
     
        
        processEvents(mynetwork,async (response)=>{
            await ipfsServer.post('/deleteProj')
            return res.status(200).send(JSON.parse(response.project))
        })
        return mynetwork.connection.submitTransaction(transaction).then(res=>{
            mynetwork.disconnect();
        }).catch(error=>{
            // console.log(error);
            res.status(400).send(error)
            mynetwork.disconnect();
        })
    

    }catch(error){
        res.status(400).send(error);
    }
    
})

module.exports = router;