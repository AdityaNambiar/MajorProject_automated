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
            await ipfsPinRM(majorHash);
            ipfs.repo.gc();
            resolve(true);
        }catch(err){
            console.log(err); 
            reject(new Error(`(removeFromIPFS) err ${err.name} :- ${err.message}`));
        }
    })
}

function ipfsPinRM(majorHash) {
    return new Promise( async (resolve, reject) => {
        try {
            console.log("mjrHash: ",majorHash);
            await ipfs.pin.rm(majorHash, {
                recursive: true
            })
            resolve(true);
        } catch(err) {
            console.log(err);
            reject(new Error(`(ipfsPinRM) err: ${err}`))
        }
        
    })
}