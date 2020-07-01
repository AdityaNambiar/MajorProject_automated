const { jenkins_url } = require('./jenkinsObj');
const jenkinslogsapi = require('jenkins')({ baseUrl: jenkins_url, crumbIssuer: true }); // Naming this specially like this because I am only using this package for getting logStream.
 
//const fs = require('fs');

module.exports = function showLogs(jobName, buildnumber){
    const io = require("../utilities/svsocket").getIo();
    return new Promise( (resolve, reject) => {
        
        try {
            //let buildnumber = fs.readFileSync(projName+'-'+'currjob_buildno.txt', 'utf8');
            var log = jenkinslogsapi.build.logStream(jobName, buildnumber);
            log.on('data', (txt) => {
                io.emit("message",{iomessage:txt,progress:0.5})
                //resolve(txt);
            })
            log.on('end', (end) => {
                console.log("stream ended, 'end' variable is: ",end);
                return resolve(end);
            })
            log.on('error', (err) => {
                console.log(err);
            })
        } catch(err) {
            console.log(err);
            reject(new Error(`showLogs err: ${err}`));
        }
    })
}
