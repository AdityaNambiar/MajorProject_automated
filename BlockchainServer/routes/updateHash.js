const express = require("express");
const config = require('config');
let networkname = config.get('networkname');
const namespace = `org.${networkname}.asset`;
const transactionType = "updateHash";
const auth = require("../utilities/auth");
const MyNetwork = require('../utilities/MyNetwork');
const router  = express.Router();
 
router.post('/',auth,async(req,res)=>{ 
    try{
        const mynetwork = new MyNetwork(req.cardName);
        await mynetwork.connect();
        let bnDef = mynetwork.connection.getBusinessNetwork();
        console.log("2. Received Definition from Runtime: ",bnDef.getName(),bnDef.getVersion());
        
        let factory  = bnDef.getFactory();
        let options = {
            generate:false,
           includeOptionalFields:false
        }
        const projectid = req.body.projectid;
        const hash = req.body.hash;
        let transaction = factory.newTransaction(namespace,transactionType,projectid,options);
    
        transaction.setPropertyValue("projectid",projectid);
        transaction.setPropertyValue("projecthash",hash);
        
        return mynetwork.connection.submitTransaction(transaction).then(response=>{
            console.log("Project Hash Updated Successfully");
            mynetwork.disconnect();
            return res.status(200).send("Project Hash Updated Successfully")
            
        }).catch(error=>{
            mynetwork.disconnect();
            return res.status(400).send(error)
        })

       } catch(error){
         return res.status(400).send(error);

       }
})
module.exports = router;