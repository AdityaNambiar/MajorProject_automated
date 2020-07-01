/**
 * This file forms the Evidence object that IPFS JS API expects and 
 * uploads it to the IPFS network.
 */
const ipfs = require('../utilities/ipfsObj');
const express = require('express');
const router = express.Router();
const upload = require("express-fileupload");
const auth = require("../utilities/auth")
router.use(upload()); // Basically allows us to access 'files' array in the "req" object in below function: 
router.post('/', auth,async (req, res) => {
    try { 
        let files = []
    
        let fileObjArr = req.files;
        for (let i = 0; i < Object.keys(fileObjArr).length; i++) {
            const filename = fileObjArr[i].name
            let obj = {
                path: `DocumentsDir/${filename}`,
                content: fileObjArr[i].data
            }
            files.push(obj);
        }
        await ipfs.add(Array.from(files), (err, results) => {

            if (err) {
                console.log(err);
                throw new Error(`(createDocument) ipfs.add err ${err.name} :- ${err.message} `)
            }

            hash = results[results.length - 1].hash; // Access hash of only the directory
            ipfs.pin.add(hash, (err, req) => {
                if (err){
                    console.log(err);
                    throw new Error(`(createDocument) ipfs.pin.add err ${err.name} :- ${err.message} `)
                }
                res.status(200).send(hash)
            });
        })
    } catch (err) {
        console.log(err);
        res.status(400).send(`(createDocument) res err ${err.name} :- ${err.message} `)
    }

})
module.exports = router