const CardExport = require('composer-cli').Card.Export;
const express =  require('express');
const fs = require('fs');
const path = require("path")
const router = express.Router();

// let cardoptions = {
//   file: `admin@labsystems.card`,
//   // card: 'dan@penguin-network'
//   card:`admin@labsystems`
// }
// CardExport.handler(cardoptions);

    async function exportCard(pIdentifier,networkName,callback){
            let cardName = `${pIdentifier}@${networkName}`
            const cardPath = `../cards/${pIdentifier}@${networkName}.card`;
            const file = path.join(__dirname,cardPath)
            fs.exists(file,(result)=>{
              if(!result){
              console.log("Exporting the card...")
                        //Exporting the Card
              let cardoptions = {
                file: `${cardName}.card`,
                // card: 'dan@penguin-network'
                card:cardName,
                
              };
                CardExport.handler(cardoptions).then((response)=>{
                  let oldpath = path.join(__dirname,`../${cardName}.card`)
                  let newpath = file;
                  fs.renameSync(oldpath,newpath);
                });
                 
                callback(true);
              }else{
                callback(false);
              }
            })

  }
  module.exports = exportCard;
