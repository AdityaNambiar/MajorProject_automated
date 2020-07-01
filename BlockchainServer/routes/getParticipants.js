
const MyNetwork = require("../utilities/MyNetwork");
const express = require('express');
const auth = require('../utilities/auth');
const router = express.Router();

router.post('/',auth,async(req,res)=>{
    const mynetwork = new MyNetwork(req.cardName);
 try{
    await mynetwork.connect();
    let bnDef = mynetwork.connection.getBusinessNetwork();
    console.log("2. Received Definition from Runtime: ",bnDef.getName(),bnDef.getVersion());
    
    let options = {
        generate:false,
       includeOptionalFields:false
    }
    let allParticipants = {}
    let pType = ["Member","ProjectManager"];
    for(let i=0;i<pType.length;i++){
       
            
            let pregistry = await mynetwork.connection.getParticipantRegistry(`org.devopschain.participant.${pType[i]}`);
            let participants = await pregistry.getAll();
            if(participants.length!=0){
                allParticipants[pType[i]] = participants;
            }
           
    } 
    mynetwork.disconnect();
    return res.status(200).send(allParticipants);
    
    }catch(error){
        mynetwork.disconnect();
        res.status(400).send(error.toString())
    }
})

module.exports = router;