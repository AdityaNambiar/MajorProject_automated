const config = require('config');
const processEvents = require('../utilities/processEvents');
let networkname = config.get('networkname');
const namespace = `org.${networkname}.asset`;
const transactionType = "getClientAsset";
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
        let clientid = req.body.clientid;
      
        
        //Creating the Transaction
        let transaction = factory.newTransaction(namespace,transactionType,clientid,options);
    
        transaction.setPropertyValue("clientid",clientid);
        processEvents(mynetwork,(response)=>{
            
            return res.status(200).send(JSON.parse(response.clientasset))
        })
        return mynetwork.connection.submitTransaction(transaction).then(res=>{
            console.log("Client Asset Read Successfully")
            mynetwork.disconnect();
        }).catch(error=>{
            // console.log(error);
            mynetwork.disconnect();
            return res.status(400).send(error)
            
        })
    

    }catch(error){
        res.status(400).send(error);
    }
    
})

module.exports = router;