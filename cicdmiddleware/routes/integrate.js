const express = require('express');
const router = express.Router();

// Utility imports:
const checkJobStatus = require('../utilities/checkJobStatus');
const preparePipelineXML = require('../utilities/preparePipelineXML');
const getConfigOfJob = require('../utilities/getConfigOfJob'); 
const readXmlFromSilo = require('../utilities/readXmlFromSilo');
const writeXmlToSilo = require('../utilities/writeXmlToSilo');
const cloneRepository = require('../utilities/cloneRepository');
const rmWorkdir = require('../utilities/rmWorkdir');
const { jenkins } = require('../utilities/jenkinsObj');
const auth = require("../utilities/auth")


router.post('/', auth,async (req, res) => {
    req.setTimeout(0) //no time-out
    const io = require("../utilities/svsocket").getIo();
        console.log("timestamp: ", Date.now());
        let projName = req.body.projName
        let branchName = req.body.branchName
    try {
        let jobName = `${projName}-${branchName}`.toLowerCase();
        let description = req.body.description || `${projName} build`;
        let jenkinsFile = req.body.jenkinsfile || 'Jenkinsfile';
        //let pollSCMSchedule = req.body.pollSCMSchedule || 'H/2 * * * *';
        // username/API token:
        
        // Setup working directory for jenkins to access it.
        let workdirpath = await cloneRepository(projName, branchName,req.pIdentifier,req.token); 
        // Updating XML by creating nodes in variables
        let jobExist = await doesJobExist(jobName);
        if (jobExist){

            let existingXml = await getConfigOfJob(jobName);
            let newPXML = await preparePipelineXML(description,
                            branchName, jenkinsFile, workdirpath, existingXml);

            await writeXmlToSilo(jobName, newPXML);
            let xmlConfigString = await readXmlFromSilo(jobName);

            console.log("job exists - updating it now");
            io.emit("message",{iomessage:"job exists - updating it now",progress:8})
            let queueId = await updateJob(jobName, xmlConfigString);
            console.log("queueId: ",queueId);
            let isCompleted = await checkJobStatus(queueId, jobName);
            console.log("isCompleted: ",isCompleted);
            io.emit("message",{iomessage:`isCompleted:${isCompleted}`,progress:8})
            if (isCompleted){
                console.log("build successful");
                io.emit("message",{iomessage:"Build Successful",progress:8})
                await rmWorkdir(projName, branchName);
                return res.status(200).send({projName: projName, branchName: branchName});
            } else {
                console.log("build unsuccessful");
                io.emit("message","Build Unsuccessful")
                await rmWorkdir(projName, branchName);
                return res.status(400).send({err:"Build Failed - Check logs!"});                
            }

        } else { 

            let newPXML = await preparePipelineXML(description,
                            branchName, jenkinsFile, workdirpath, null);
           
            await writeXmlToSilo(jobName, newPXML);
            let xmlConfigString = await readXmlFromSilo(jobName);

            console.log("job does not exists - creating it now");
            io.emit("message",{iomessage:"Job does not exists - creating it now",progress:8})
            let queueId = await createJob(jobName, xmlConfigString);
            console.log("queueId: ",queueId);
            let isCompleted = await checkJobStatus(queueId, jobName);
            console.log("isCompleted: ",isCompleted);
            io.emit("message",{iomessage:`isCompleted:${isCompleted}`,progress:8})
            if (isCompleted){
                console.log("build successful");
                io.emit("message",{iomessage:"Build Successful",progress:8})
                await rmWorkdir(projName, branchName);
                return res.status(200).send({projName: projName, branchName: branchName});
            } else {
                console.log("build unsuccessful");
                io.emit("message","build unsuccessful")
                await rmWorkdir(projName, branchName);
                return res.status(400).send({err:"Build Failed - Check logs!"});                
            }

        }
    } catch (err) {
        console.log(err);
        await rmWorkdir(projName, branchName);
        return res.status(400).send({err:`(integrate) main err ${err.name} :- ${err.message}`});
    }
})

function doesJobExist(jobName){
    const io = require("../utilities/svsocket").getIo();
    io.emit("message",{iomessage:"Checking if job exists...",progress:8})
    return new Promise( (resolve, reject) => {
        try {
            jenkins.get_config_xml(jobName, (err, data) => {
                if (err === "Server returned unexpected status code: 404"){ 
                    return resolve(false) // means job does not exist
                }  else {
                    return resolve(true); // means job does exist
                }  
            });
        } catch(err) {
            console.log(err);
            return reject(new Error(`(doesJobExist) err: `+err));
        }
    })
}


function createJob(jobName, xmlConfigString) {
    const io = require("../utilities/svsocket").getIo();
    io.emit("message",{iomessage:"Creating Job",progress:8})
    return new Promise( (resolve, reject) => {
        try {
            jenkins.create_job(jobName, xmlConfigString, (err, data) => {
                if (err) {
                    console.log(err);
                    return reject(new Error("jenkins create-job: \n"+err))
                } else {
                    jenkins.build(jobName, function(err, data) {
                      if (err){ 
                        console.log(err);
                        return reject(new Error("jenkins build-job: \n"+err))
                      } else {
                         return resolve(data.queueId);
                      }
                    });
                }
            })
        } catch(err) {
            console.log(err);
            return reject(new Error(`(createJob) err ${err.name} :- ${err.message}`));
        }
    })
}
function updateJob(jobName, xmlConfigString) {
    const io = require("../utilities/svsocket").getIo();
    console.log("updateJob executed");
    io.emit("message",{iomessage:"Updating Job",progress:8})
    return new Promise( (resolve, reject) => {
        try {
            jenkins.update_job(jobName, xmlConfigString, (err, data) => {
                if (err) {
                    console.log(err);
                    return reject(new Error("jenkins update-job: \n"+err))
                } else {
                    jenkins.build(jobName, function(err, data) {
                      if (err){ 
                        console.log(err);
                        return reject(new Error("jenkins build-job: \n"+err))
                      } else {
                        return resolve(data.queueId);
                      }
                    })
                }
            })
        } catch(err) {
            console.log(err);
            return reject(new Error(`(updateJob) err ${err.name} :- ${err.message}`));
        }
    })
}



module.exports = router