const config = require('config');
 function processEvents(bnUtil,callback){
        
    bnUtil.connection.on('event',(event)=>{
        const networkname = config.get('networkname');
        const NS = `org.${networkname}.asset`
        var namespace = event.$namespace;
        var eventtype = event.$type;
        var fqn = namespace+'.'+eventtype;
        // #3 Filter the events
        switch(fqn){
            case    `${NS}.participantCreated`:
                    returnResponse(bnUtil,callback,event);    
                    break;
            case    `${NS}.projectCreated`:
                    returnResponse(bnUtil,callback,event);    
                    break;
            case    `${NS}.projectRead`:
                    returnResponse(bnUtil,callback,event);  
                    break;
            case    `${NS}.projectUpdated`:
                    returnResponse(bnUtil,callback,event);    
                    break;
            case    `${NS}.participants`:
                     returnResponse(bnUtil,callback,event);    
                      break;
             case     `${NS}.AccessStatus`:
                        returnResponse(bnUtil,callback,event);
                        break;
            case      `${NS}.projects`:
                        returnResponse(bnUtil,callback,event);    
                        break;
            case    `${NS}.projectsOfManager`:
                     returnResponse(bnUtil,callback,event); 
                        break;
             case    `${NS}.projectDeleted`:
                        returnResponse(bnUtil,callback,event); 
                         break;
             case    `${NS}.projectsOfMember`:
                        returnResponse(bnUtil,callback,event); 
                        break;
            case    `${NS}.chatCreated`:
                        returnResponse(bnUtil,callback,event); 
                        break;
            case    `${NS}.clients`:
                        returnResponse(bnUtil,callback,event); 
                        break;
            case    `${NS}.clientAssetRead`:
                        returnResponse(bnUtil,callback,event); 
                        break;
        
            default:    
                    console.log("Ignored event: ", fqn);
        }
    });
}

function returnResponse(bnUtil,callback,event){
        // console.log(event)
        callback(event);
//     bnUtil.disconnect();
}
module.exports = processEvents;
