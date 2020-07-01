const config = require('config');
const processEvents = require('../utilities/processEvents');
let networkname = config.get('networkname');
const namespace = `org.${networkname}.asset`;
const transactionType = "updateProject";
const MyNetwork = require('../utilities/MyNetwork');
const express = require('express');
const auth = require('../utilities/auth');
const router = express.Router();
let serializer = require('composer-common').Serializer;

router.post('/',auth,async(req,res)=>{
    const mynetwork = new MyNetwork(req.cardName);
    try{

        await mynetwork.connect();
        let bnDef = mynetwork.connection.getBusinessNetwork();
        console.log("2. Received Definition from Runtime: ",bnDef.getName(),bnDef.getVersion());
        
        let factory  = bnDef.getFactory();
        // console.log(factory)
        let options = {
            generate:false,
           includeOptionalFields:false
        }
        //Setting the transaction variables
        let projectid = req.body.projectid;
        let description = req.body.description; 
        let private = req.body.private; 
        let collaborators = req.body.collaborators;
        let projecthash = req.body.projecthash;
        
        let resources = [];
    collaborators.map((obj)=>{
        resources.push(new serializer(factory,bnDef.getModelManager()).fromJSON(obj))
    })
    let transaction = factory.newTransaction(namespace,transactionType,projectid,options);
        transaction.setPropertyValue("projectid",projectid);
        transaction.setPropertyValue("description",description);
        transaction.setPropertyValue("private",private);
        transaction.setPropertyValue("collaborators",resources);
        transaction.setPropertyValue("projecthash",projecthash);
       
        processEvents(mynetwork,(response)=>{
            
            res.status(200).send(JSON.parse(response.project))
        })
        return mynetwork.connection.submitTransaction(transaction).then(res=>{
            console.log("Project Updated Successfully");
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