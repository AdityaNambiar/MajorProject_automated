/**
 * UTILITY
 * For unpinning and running 'ipfs repo gc' on folder to erase majorHash from IPFS (local repo only).
 */

// Terminal execution import
const { exec } = require('child_process');

const path = require('path');

// ipfs related import and setup
const ipfs = require('./ipfsObj');

module.exports = function removeFromIPFS(majorHash){

    var projectsPath = path.resolve(__dirname, '..', 'projects'); 
    return new Promise( async (resolve, reject) => {
        try{
            exec(`ipfs pin rm ${majorHash}; ipfs repo gc;`, {
                cwd: projectsPath,
                shell: true,
            }, (err, stdout, stderr) => {
                if (err){
                    console.log(`(removeFromIPFS) err: ${err}`);
                    //reject(new Error(`(removeFromIPFS) cli err ${err.name} :- ${err.message}`))
                }
                if (stderr){
                    console.log(`(removeFromIPFS) stderr: ${stderr}`);
                    //reject(new Error(`(removeFromIPFS) cli stderr :- ${err.message}`))
                }
                console.log(stdout);
                resolve(true);
            });
        }catch(err){
            console.log(err); 
            reject(new Error(`(removeFromIPFS) err ${err.name} :- ${err.message}`));
        }
    })
}
