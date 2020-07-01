const config = require('config');
const processEvents = require("./processEvents");
let networkname = config.get('networkname');
const namespace = `org.${networkname}.asset`;
const transactionType = "checkAccess";
const MyNetwork = require("./MyNetwork");
const {checkAccess,readops} =  require("./checkAccess")



module.exports = async function (cardName,projectid,operation){

   return new Promise(async (resolve,reject)=>{
    const mynetwork = new MyNetwork(cardName);
    try{

        await mynetwork.connect();
        let bnDef = mynetwork.connection.getBusinessNetwork();
        // console.log("2. Received Definition from Runtime: ",bnDef.getName(),bnDef.getVersion());
        
        let factory  = bnDef.getFactory();
        let options = {
            generate:false,
           includeOptionalFields:false
        }
        
        //Creating the Transaction
        let transaction = factory.newTransaction(namespace,transactionType,projectid,options);
    
        transaction.setPropertyValue("projectid",projectid);
         
        processEvents(mynetwork,(response)=>{
             operation = operation
            let accessobj = JSON.parse(response.status); 
            let access = checkAccess(operation,accessobj);
            resolve({access,accessobj,mynetwork,factory})
            
        })

         mynetwork.connection.submitTransaction(transaction).then(resp=>{
           
        }).catch(error=>{
            reject(error)
            
        }) 

    }catch(error){
        reject(error)
    }
   })
}