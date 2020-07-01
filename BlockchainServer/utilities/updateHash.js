const config = require('config');
let networkname = config.get('networkname');
const namespace = `org.${networkname}.asset`;
const transactionType = "updateHash";
function updateHash(mynetwork,factory,projectid,hash){
    
        return new Promise((resolve,reject)=>{
           try{
            let options = { 
                generate:false,
               includeOptionalFields:false
            }
    
            let transaction = factory.newTransaction(namespace,transactionType,projectid,options);
        
            transaction.setPropertyValue("projectid",projectid);
            transaction.setPropertyValue("projecthash",hash);
            
            return mynetwork.connection.submitTransaction(transaction).then(response=>{
                console.log("Project Hash Updated Successfully");
                return resolve(true);
                
            })
 
           } catch(error){
             return reject(error)

           }
               
        })
        
}    
   
    


module.exports = updateHash;