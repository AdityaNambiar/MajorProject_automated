const config = require('config');
const processEvents = require('../utilities/processEvents');
let networkname = config.get('networkname');
const namespace = `org.${networkname}.asset`;
const transactionType = "getAllProjects";
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
         
        //Creating the Transaction
        let transaction = factory.newTransaction(namespace,transactionType,networkname,options);
    
       
        
        processEvents(mynetwork,(response)=>{
            //Filtering all Projects returned from blockchain and sending only public projects as a response.
            let projects = response.projects;
            let result = JSON.parse(projects).filter((project)=>project.private==false)
            res.status(200).send(result)
        })
        return mynetwork.connection.submitTransaction(transaction).then(res=>{
            console.log("Projects Retreived Successfully...")
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