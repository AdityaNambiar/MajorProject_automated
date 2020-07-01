const AdminConnection = require('composer-admin').AdminConnection;
const express = require('express');
const router = express.Router();
const path = require('path')
const exportCard = require('../utilities/exportCard')
const MyNetwork = require('../utilities/MyNetwork');
const auth = require('../utilities/auth');
const http = require('http');
const fs = require('fs');
const stream = require('stream') 
router.post('/',async(req,res)=>{
//   const mynetwork = new MyNetwork(req.cardName);
//   const pType = req.pType;
  try{
    // if(pType!=='Director' && pType!=='NetworkAdmin'){
    //   return res.status(400).send('You Are Not Allowed to Download the Card...')
    //   // throw new Error('You Are Not Allowed to Download the Card...')
    // }
    // await mynetwork.connect();
    // const pIdentifier = req.body.pIdentifier;
    // console.log(req.query.pIdentifier)
    
    let pIdentifier = req.body.pIdentifier;
    const networkName = 'devopschain';
    exportCard(pIdentifier,networkName,(response)=>{
        const cardPath = `../cards/${pIdentifier}@${networkName}.card`;
        const file = path.join(__dirname,cardPath);
       if(response==true){
        const myVar = setInterval(checkFile,500);
        async function checkFile(){
          let result = fs.existsSync(file);
          if(result==true){
              clearInterval(myVar);
              console.log("Downloading Card, result true")
               // await new AdminConnectison().deleteCard(`${pIdentifier}@${networkName}`)
              // console.log(file)
              res.download(file,`${pIdentifier}@${networkName}.card`);
          
          }
            
          }
       }else if(response==false){
        console.log("Downloading Card, result false")
        res.download(file,`${pIdentifier}@${networkName}.card`);
       }    
    })

  }catch(error){
      res.status(400).send(error); 
  } 
   

})
module.exports = router;