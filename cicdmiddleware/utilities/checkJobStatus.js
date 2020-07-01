/**
	Every 5 seconds, look at Jenkins queue to know whether a build has been started or not (queue turned 'executable' or not) 
*/

const fs = require('fs');
const { jenkins, jenkins_url } = require('./jenkinsObj');
const jenkinsbuildstatusapi = require('jenkins')({ baseUrl: jenkins_url, crumbIssuer: true }); // name defines the only purpoe of importing this package here.
const showBuildLogs = require('./showBuildLogs');

module.exports = function checkJobStatus(queueId, jobName){
    let io = require("../utilities/svsocket").getIo();
    return new Promise((resolve, reject) => {
        try {
            let queueVar =  setInterval(queuecheck,3000);
            let queuelabel = () => {
                return new Promise( async (resolve, reject) => {
                    await jenkins.queue_item(queueId, (err, data) =>{
                        if (err){
                            console.log(err);
                            return reject(new Error(`(checkJobStatus) queue-item err ${err.name} :- ${err.message}`))
                        } else {
                            //console.log("queue_item get: \n", data);
                            return resolve(data);
                        } 
                    })
                })
            }
            let queuedata = {};
            async function queuecheck(){
                if(!queuedata.hasOwnProperty("executable")){
                    console.log("build not started")
                    queuedata = await queuelabel();
                    //queuecheck();
                } else{
                    clearInterval(queueVar); 
                    console.log("build started")
                    io.emit("message",{iomessage:"Build Started",progress:8})
                    let buildnumber = queuedata.executable.number;
                    // GET Build number.
                    // fs.writeFileSync(jobName+'-'+'currjob_buildno.txt', buildnumber);
                    let buildLogs = await showBuildLogs(jobName, buildnumber);
                    let builddata = await buildStatus(jobName, buildnumber); 
                    //console.log(builddata);
                    if (builddata.result !== 'SUCCESS'){  
                        return resolve(false);
                    } else {
                        return resolve(true);
                    }
                }
            }
        } catch(err) {
            console.log(err);
            return reject(new Error(`(checkJobStatus) err ${err.name} :- ${err.message}`));
        }
    })
}

function buildStatus(jobName, buildnumber){
    return new Promise( async (resolve, reject) => {
        await jenkinsbuildstatusapi.build.get(jobName, buildnumber, (err, data) => {
          if (err) {
            console.log(err);
            return reject(new Error(`(checkJobStatus) jenkins-build-get err ${err.name} :- ${err.message}`))
          } else {
            return resolve(data);
          }
        })
    })
}