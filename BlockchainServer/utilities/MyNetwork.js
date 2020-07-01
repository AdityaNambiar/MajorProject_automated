const jwt = require('jsonwebtoken');
const config = require('config');
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
const IdCard = require('composer-common').IdCard;
const FileSystemCardStore = require('composer-common').FileSystemCardStore;
const BusinessNetworkCardStore = require('composer-common').BusinessNetworkCardStore;
const AdminConnection = require('composer-admin').AdminConnection;
const NetworkCardStoreManager= require('composer-common').NetworkCardStoreManager;
var walletType = { type: 'composer-wallet-filesystem' }
const cardStore = NetworkCardStoreManager.getCardStore( walletType );
// var fileSystemCardStore = new FileSystemCardStore();

let businessNetworkCardStore = new BusinessNetworkCardStore();
let adminConnection = new AdminConnection();

class MyNetwork{
    constructor(cardName) {
        this.currentParticipantId;
        this.cardName = cardName;
        this.connection = new BusinessNetworkConnection();
      }
     static async importCardToNetwork(cardData){
        let idCardName="";
       try{  
        let businessNetworkConnection = new BusinessNetworkConnection();
        const idCardData = await IdCard.fromArchive(cardData);
        idCardName = await BusinessNetworkCardStore.getDefaultCardName(idCardData);
        
        const result = await cardStore.put(idCardName,idCardData); 
        const imported = await adminConnection.importCard(idCardName,idCardData);
        if(imported){
            const bnaDef = await  businessNetworkConnection.connect(idCardName);
            if(!bnaDef){
                return null;
            }
        //   let idcard = await cardStore.get(idCardName);
        //   let username = idcard.getUserName();
            return idCardName;
        }else{
            return null;
         } 
     }catch(error){ 
         
         await adminConnection.deleteCard(idCardName);
         console.log(error);
         
     }
        
    }

  async connect(){
      try {
      let result = await this.connection.connect(this.cardName);
        return result;
      }catch(error){
          console.log(error);
        
      }
  }
  async ping(){
      let result = await this.connection.ping();
      return result;
  }
  async logout(){
      let _this = this;
      console.log(_this.cardName)
      return this.ping().then(function(){
          return adminConnection.deleteCard(_this.cardName);
      })
  }
  async disconnect(){
      try{
            await this.connection.disconnect();
      }catch(error){
          console.log(error);
          
      } 
  }

   generateAccesToken(idCardName){
   return new Promise((resolve,reject)=>{
    let privateKey = config.get("jwtPrivateKey");
    if(!privateKey){
        console.log("Private key not found");
        
    }
    let bnc = new BusinessNetworkConnection();
     bnc.connect(idCardName);
    bnc.connect(idCardName).then(connections=>{
        
        bnc.getIdentityRegistry().then(identityRegistry=>{
            identityRegistry.getAll().then(identities=>{
                let pIdentifier  = idCardName.split(`@${config.get("networkname")}`)[0];
                // console.log("pIdentifier=>",pIdentifier);
                let pType = null;
                
                for(let i=0;i<identities.length;i++){
                           let identity = identities[i];
                           let type = identity.participant.$type;
                           if(pIdentifier==identity.participant.$identifier){
                            pType = type;
                            
                            break;
                           }
                       }  
                       
                       bnc.getParticipantRegistry(`org.devopschain.participant.${pType}`).then(pregistry=>{
                        pregistry.get(pIdentifier).then(par=>{
                          let participant = {
                              "fname":par.fname,
                              "lname":par.lname,
                              "designation":par.designation,
                              "emailid":par.emailid,
                              "contact":par.contact,
                              "gender":par.gender
                          }
                           const token = jwt.sign({"cardName":idCardName,"pType":pType,"pIdentifier":pIdentifier,participant},privateKey)
                       resolve(token);
                        })
                    })
                 
                       
            }).catch(error=>{})
        }).catch(error=>{})
    }).catch(error=>{})
         
    })    
  }
}
// const token = jwt.sign({"cardName":idCardName,"pType":pType,"pIdentifier":pIdentifier},privateKey)
//                        resolve(token);

module.exports = MyNetwork; 