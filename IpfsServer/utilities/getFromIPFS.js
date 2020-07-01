/**
 * UTILITY
 * For getting repository from IPFS
 * 
 * 1. Perform a IPFS get on the majorHash. Since its a directory hash, we need to first do 
 */

// Terminal execution import
const { exec } = require('child_process');

const path = require('path');
const fs = require('fs');
// ipfs related import and setup
const ipfs = require('./ipfsObj');

module.exports = function getFromIPFS(majorHash, projName){
    
    let barepath = path.resolve(__dirname, '..', 'projects','bare');
    
    return new Promise(async (resolve, reject) => {
        try {
            await barePathCheck(barepath);
            exec(`ipfs get '${majorHash}' -o '${projName+'.git'}'`, {
                cwd: barepath,
                shell: true,
            },(err,stdout,stderr) => {
                if (err) { console.log(err); reject(new Error(`ipfs get cli err ${err.name} :- ${err.message}`)); } 
                if (stderr) { console.log('ipfs get cli stderr: '+stderr); }
                resolve(true);
            })
        } catch (err) {
            console.log(err); 
            reject(new Error(`ipfs get err ${err.name} :- ${err.message}`));
        }
    })        
}

function barePathCheck(barepath){
    return new Promise( (resolve, reject) => {
        if (!fs.existsSync(barepath)){
            fs.mkdir(barepath, (err) => {
                if (err) {
                    console.log(err); 
                    reject(new Error(`barePathCheck err ${err.name} :- ${err.message}`));
                }
                resolve(true);
            })
        }
        resolve(true); // means projects/bare exist.
    })
}
