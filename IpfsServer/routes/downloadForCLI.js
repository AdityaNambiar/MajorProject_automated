/** 
 * Download the repository (the one with working directory - the mergeid one)
 * -- take mergeid 
 * -- zip that folder and send for download (like in downloadRepo)
 * -- remove the folder of this name (branchNamepath/mergeid).
 * 
 */

const rmWorkdir = require('../utilities/rmWorkdir');

const { zip } = require('zip-a-folder');
// isomorphic-git related imports and setup
const fs = require('fs');
const git = require('isomorphic-git');

const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const app = express();

app.use(bodyParser.json());


router.post('/downloadForCLI', async (req, res) => {
    try {
        var projName = req.body.projName;
        var mergeid = req.body.mergeid;
        var branchToUpdate = req.body.branchToUpdate;

        var workdirpath = path.resolve(__dirname, '..', 'projects', projName, branchToUpdate, mergeid);
        var projNamepath = path.resolve(__dirname, '..', 'projects', projName + '.zip');

        await zip(workdirpath, projNamepath)
        await rmWorkdir(workdirpath);
        res.download(path.resolve(__dirname, '..', 'projects', `${projName}.zip`), (err) => {
            if (err) {
                console.log(err);
                res.status(400).send(`(downloadForCLI) res-download err ${err.name} :- ${err.message}`);
            }
        })
    } catch (err) {
        console.log(err);
        res.status(400).send(`(downloadForCLI) err ${err.name} :- ${err.message}`);
    }
})

module.exports = router; 