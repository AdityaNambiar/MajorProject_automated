const config = require('config');
const processEvents = require('./processEvents');
let networkname = config.get('networkname');
const namespace = `org.${networkname}.asset`;
const verifyToken = require("./verifytoken")
const MyNetwork = require('./MyNetwork');

module.exports =  (cardName,room,chat,chatType)=>{

    return new Promise(async(resolve,reject)=>{
        const mynetwork = new MyNetwork(cardName);
        let transactionType = null;
        if(chatType=="Client"){
            transactionType = "createClientChat";
        }else if(chatType=="Collaborator"){
            transactionType = "createCollaboratorChat";
        }
    
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
        let chatconcept = factory.newConcept("org.devopschain.asset","Chat");
        chatconcept.username = chat.username;
        chatconcept.message = chat.message;
        chatconcept.sent = true;
        chatconcept.timestamp = chat.timestamp
        //Creating the Transaction
        let transaction = factory.newTransaction(namespace,transactionType,room,options);
    
        transaction.setPropertyValue("chatid",room);
        transaction.setPropertyValue("chat",chatconcept);
        processEvents(mynetwork,(response)=>{
            
             return resolve(JSON.parse(response.chat));
        })
        return mynetwork.connection.submitTransaction(transaction).then(res=>{
            // console.log("Chat Created Successfully");
            mynetwork.disconnect();
        }).catch(error=>{
            mynetwork.disconnect();
            throw new Error(error)
        })
    

    }catch(error){
        throw new Error(error)
    }



    })

}
    


