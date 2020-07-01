const express = require('express');
const config = require('config');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const socketserver = require("./server");
// const nocache = require("nocache");
const home = require('./routes/home');
const createParticipant = require('./routes/createMember');
const downloadCard = require('./routes/downloadCard'); //No Acces Check
const bnUtil = require('./routes/bnUtil');
const createProject = require('./routes/createProject'); 
const readProject = require('./routes/readProject');  //No Access Check 
const updateProject = require('./routes/updateProject');
const getMembers = require('./routes/getMembers'); //Not done Access Check
const accessControl = require("./routes/accessControl");
const getAllProjects =require('./routes/getAllProjects'); //Not done Access Check
// const getProjectsOfManager = require('./routes/getProjectsOfManager');
const deleteProject =require('./routes/deleteProject');//=> to Ipfs
const getProjectsOfMember  = require('./routes/getProjectsOfMember');
const getParticipants = require("./routes/getParticipants")
const updateHash = require("./routes/updateHash");
const addDocumentHash = require("./routes/addDocumentHash");
const getClients = require("./routes/getClients");
const getClientAsset = require("./routes/getClientAsset");

const getFiles = require("./routes/getFiles");

if(!config.get("jwtPrivateKey")){
    console.error("FATAL error: Jwt key not defined...");
    process.exit(1);
  }
require("events").EventEmitter.defaultMaxListeners = 100;
// app.set('etag',false);
// app.use((req,res,next)=>{
//   res.set('Cache-Control','no-store');
//   next();
// })
// app.use(nocache())
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(bodyParser.json());
app.use(cors());
app.use('/',home);
app.use('/createParticipant',createParticipant);
app.use('/downloadCard',downloadCard);
app.use('/bnUtil',bnUtil);
app.use('/createProject',createProject); //=> toIpfs => Blockchain(for updating hash);
app.use('/readProject',readProject); // => toIpfs 

app.use('/updateProject',updateProject);
app.use('/getMembers',getMembers);
app.use('/checkAccess',accessControl); // toIpfs
app.use('/getAllProjects',getAllProjects); //For getting Public Projects
// app.use('/getProjectsOfManager',getProjectsOfManager); 
app.use('/deleteProject',deleteProject); // toIpfs
app.use('/getProjectsOfMember',getProjectsOfMember);
app.use('/getParticipants',getParticipants);
app.use('/updateHash',updateHash);
app.use("/addDocumentHash",addDocumentHash);
app.use("/getClients",getClients);
app.use("/getClientAsset",getClientAsset);
app.use("/getFiles",getFiles);
const socketport = process.env.SOCKET_PORT || 6800
const port = process.env.PORT||4000;
app.listen(port,()=>{console.log(`Listening on port ${port}...`)})


socketserver.listen(socketport,()=>console.log(`Socket Server listening on port ${socketport}...`))