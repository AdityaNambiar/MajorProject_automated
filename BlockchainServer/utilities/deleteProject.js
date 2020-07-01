module.exports = (mynetwork,factory,projectid)=>{
    const config = require('config');
    let networkname = config.get('networkname');
    const namespace = `org.${networkname}.asset`;
    const transactionType = "deleteProject";
    return new Promise((resolve,reject)=>{
        let options = {
            generate:false,
           includeOptionalFields:false
        }
         //Creating the Transaction
         let transaction = factory.newTransaction(namespace,transactionType,projectid,options);
    
         transaction.setPropertyValue("projectid",projectid);
      
         
         return mynetwork.connection.submitTransaction(transaction).then(res=>{
            resolve(true)
         }).catch(error=>{
             // console.log(error);
            reject(error)
             
         })
    })

}
