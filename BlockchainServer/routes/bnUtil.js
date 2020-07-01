const express = require('express');
const router =  express.Router();
const auth = require('../utilities/auth')
const upload = require('express-fileupload'); 
router.use(upload());
const MyNetwork = require('../utilities/MyNetwork');
 
router.post('/login',async (req,res)=>{
    try{
        // console.log("Entered Login Route...");
        // console.log(req)
    const idCardName = await MyNetwork.importCardToNetwork(req.files.card.data);
    console.log(idCardName)
    if(!idCardName){
        console.log("Invalid Card..")
        res.status(403).send({message:"Logging failed"});
    }else{
        
        const token = await new MyNetwork(idCardName).generateAccesToken(idCardName);
        res.json({messsage:"Logging Successful",acessToken:token,username:idCardName})
        // res.setHeader('x-auth-token',token).send({messsage:"Logging Successful",acessToken:token});
        
    }
    }catch(error){
        console

        res.status(403).send({message:"Login failed",error:error.toString()})
    }
})

router.post('/logout',auth,async(req,res)=>{
    let cardName = req.cardName;
    let mynetwork = new MyNetwork(cardName);
    mynetwork.connect().then(function () {
        return mynetwork.logout()
    }).then(function () { 
        res.json({ message: "Logout Successfully" });
    }).catch(function(error) {
        console.log(error);
        res.status(500).json({ error: error.toString() })
    })
})
module.exports = router;