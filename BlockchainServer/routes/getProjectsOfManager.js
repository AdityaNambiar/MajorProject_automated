const config = require('config');
const processEvents = require('../utilities/processEvents');
let networkname = config.get('networkname');
const namespace = `org.${networkname}.asset`;
const transactionType = "getProjectsOfManager";
const MyNetwork = require('../utilities/MyNetwork');
const express = require('express');
const auth = require('../utilities/auth');
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
        // let pType = req.body.pType;
        // let pIdentifier = req.body.pIdentifier;
        //Creating the Transaction
        let transaction = factory.newTransaction(namespace,transactionType,projectid,options);
    
        // transaction.setPropertyValue("pType",pType);
        // transaction.setPropertyValue("pIdentifier",pIdentifier);
        
        processEvents(mynetwork,(response)=>{
            
            res.status(200).send(JSON.parse(response.projects))
        })
        return mynetwork.connection.submitTransaction(transaction).then(res=>{
            
            mynetwork.disconnect();
        }).catch(error=>{
            // console.log(error);
            res.status(400).send(error.toString())
            mynetwork.disconnect();
        })
    

    }catch(error){
        res.status(400).send(error.toString());
    }
    
})

module.exports = router;