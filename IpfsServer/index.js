const express = require('express');

const app = express();
const axios = require("axios");
const config = require("config")
const bodyParser = require('body-parser');
const path = require('path');
const Server = require('node-git-server');
const checkAccess = require("./utilities/checkAccess");
const addToIPFS = require('./utilities/addToIPFS');

const cors = require('cors');
// require('events').EventEmitter.defaultMaxListeners = 100;

// route imports:
const initProj = require('./routes/initProj');
const gitGraph = require('./routes/gitGraph');
const deleteProj = require('./routes/deleteProj');

const getFiles = require('./routes/getFiles');
const deleteFile = require('./routes/deleteFile');
const commitFile = require('./routes/commitFile');
const diffFiles = require('./routes/diffFiles');
const diffForCommit = require('./routes/diffForCommit');
const mergeBranch = require('./routes/mergeBranch');
const fileCommitHistory = require('./routes/fileCommitHistory');
const readFile = require('./routes/readFile');

const addBranch = require('./routes/addBranch');
const getBranches = require('./routes/getBranches');
const deleteBranch = require('./routes/deleteBranch');
const branchCommitHistory = require('./routes/branchCommitHistory');

const getMergeObj = require('./routes/getMergeObj');
const mergeCommit = require('./routes/mergeCommit');
const readMergeFiles = require('./routes/readMergeFiles');
const checkoutBranch = require('./routes/checkoutBranch');
const downloadRepo = require('./routes/downloadRepo');
const downloadForCLI = require('./routes/downloadForCLI');
const deleteMergeRequest = require('./routes/deleteMergeRequest');
// Client Document operation routes:
const createDocument = require("./ipfsroutes/createDocument");
const downloadDocument = require("./ipfsroutes/downloadDocument")
const readDocumentByHash = require("./ipfsroutes/readDocumentByHash")
const getFilesTree = require("./routes/getFilesTree")
app.use(cors());
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname,'routes', 'sample.html')));
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname,'routes','sample.html'));
});

app.post('/initProj', initProj);
app.post('/gitGraph', gitGraph); 
app.post('/downloadRepo', downloadRepo);
app.post('/deleteProj', deleteProj);

app.post('/getFiles',getFiles);
app.post('/deleteFile',deleteFile);
app.post('/commitFile',commitFile);
app.post('/diffFiles', diffFiles);
app.post('/diffForCommit', diffForCommit);
app.post('/mergeBranch', mergeBranch); 
app.post('/fileCommitHistory', fileCommitHistory);
app.post('/readFile',readFile); 

app.post('/addBranch', addBranch);
app.post('/getBranches', getBranches);
app.post('/deleteBranch', deleteBranch);
app.post('/branchCommitHistory', branchCommitHistory);

app.post('/getMergeObj', getMergeObj);
app.post('/mergeCommit', mergeCommit);
app.post('/readMergeFiles', readMergeFiles);
app.post('/checkoutBranch', checkoutBranch);
app.post('/downloadForCLI', downloadForCLI);
app.post('/deleteMergeRequest', deleteMergeRequest);
app.use('/createDocument', createDocument);
app.use('/readDocument', readDocumentByHash);
app.use('/downloadDocument', downloadDocument);
app.use("/getFilesTree",getFilesTree)

var authtoken = null;
const repos = new Server(path.resolve(__dirname), {
    autoCreate: true,
    authenticate: ({ type, repo, user,headers}, next) => {
        let projectid = repo.split("/").splice(-1)[0];
        
    return new Promise((resolve,reject)=>{

        user(async (username,password)=>{
            authtoken = password
        let access =  await checkAccess(password,projectid,"PUSH");
       try{ 
            if(access){
                    resolve();
                    return next();
            }else{
                return reject(`You are not allowed to ${type} this repo`);
                        
                }
        }catch(error){
            return reject(error);

        } })     

     })
   
}

     
});

if(!config.get("jwtPrivateKey")){
    console.error("FATAL error: Jwt key not defined...");
    process.exit(1);
  }

    repos.on('push', async (push) => {
       try{ 
        push.accept()
        let projName = push.repo.split('bare/')[1].split('.git')[0];
        let barerepopath = path.resolve(__dirname, 'projects', 'bare', projName+'.git'); 
        const majorHash = await addToIPFS(barerepopath);
        let authserver = config.get("authserver");
        let body = {projectid:projName, hash:majorHash}
        await axios.post(`${authserver}/updateHash`,body,{
                        headers:{
                            "x-auth-token":authtoken
                        }
                    })

       }catch(error){
            console.log(error);
       }

        // console.log(atob(push.headers.authorization.split("Basic")[1]))
        
       
    });
    
    repos.on('fetch', async (fetch) => {
        fetch.accept();
    });
    

process.on('uncaughtException', (err) => {
    
})

const cliserver_port = process.env.CLI_PORT || 7005;
const ipfsServer_port = process.env.IPFS_SERVER_PORT || 5000
app.cliserver = repos;

app.cliserver.listen(cliserver_port, () => {
    console.log(`node-git-server running at http://localhost:${cliserver_port}`);
});

app.listen(ipfsServer_port,()=>console.log(`Ipfs Server running on port ${ipfsServer_port}`))
