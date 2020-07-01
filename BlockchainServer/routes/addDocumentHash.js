const config = require('config');
const processEvents = require('../utilities/processEvents');
let networkname = config.get('networkname');
const namespace = `org.${networkname}.asset`;
const transactionType = "addDocumentHash";
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
        let cpid = req.body.cpid;
        let documenthash = req.body.documenthash;
        
        //Creating the Transaction
        let transaction = factory.newTransaction(namespace,transactionType,cpid,options);
    
        transaction.setPropertyValue("cpid",cpid);
        transaction.setPropertyValue("documenthash",documenthash);
        // processEvents(mynetwork,(response)=>{
            
        //     return res.status(200).send("Document Hash Updated Successfully")
        // })
        return mynetwork.connection.submitTransaction(transaction).then(response=>{
            console.log("Hash Added Successfully");
            mynetwork.disconnect();
            return res.status(200).send("Document Hash Updated Successfully")
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