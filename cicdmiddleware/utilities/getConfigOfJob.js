/**
    Get the configuration XML file of an existing job.
*/
const { jenkins } = require('./jenkinsObj');

module.exports = function getConfigOfJob(jobName){
    return new Promise( (resolve, reject) => {
        try {
            jenkins.get_config_xml(jobName, function(err, data) {
                if (err === "Server returned unexpected status code: 404"){ 
                    return resolve(false) // means job does not exist or this error mentioned in condition
                } else {
                    return resolve(data); // means job does exist and send its xml 
                }
            });
        } catch(err) {
            console.log(err);
            return reject(new Error(`(doesJobExist) err: `+err));
        }
    })
}