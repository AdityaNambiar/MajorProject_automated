const path = require('path');
const express = require('express');
const router = express.Router();
const fs = require('fs');
const { exec } = require('child_process');
const Docker = require('dockerode');
const dockerapi = new Docker();
const tar = require('tar-fs');
const config = require("config")
const IP = config.get("registry_ip")
const registryPort = 7009; // Ideally you can set this as process.env or something like this to take in the registry port no. from environment variables.

 // (async () => {
 //     const nets = await dockerapi.createNetwork({
 //        Name: "sample1",
 //        CheckDuplicate: true
 //     });
 //     console.log(await nets);
 //     const networks = await dockerapi.listNetworks();
 //     console.log(await networks);
 // })();

// Utility imports:

const cleanUp = require('../utilities/cleanUp');
const cloneRepository = require('../utilities/cloneRepository');
const rmWorkdir = require('../utilities/rmWorkdir');
const auth = require("../utilities/auth")
router.post('/', auth,async (req, res) => {

    req.setTimeout(0) //no time-out
        const io = require("../utilities/svsocket").getIo()
        let projName = req.body.projName;
        let branchName = req.body.branchName;
        // let tagName = req.body.tagName.toString().toLowerCase();

    try {
        
        let workdirpath = await cloneRepository(projName, branchName,req.pIdentifier,req.token);
        let imageName = `${IP}:${registryPort}/${projName}:${branchName}`.toLowerCase();
        let jobName = `${projName}-${branchName}`.toLowerCase();
        
        io.emit("message",{iomessage:"Starting your build, please wait...",progress:2}) 
        await cleanUp(imageName, jobName);
        await buildImage(workdirpath,imageName);
        await pushImage(imageName);
        // await cleanUp(imageName, jobName);
        await pruneImages();
        //await pruneContainers(); 
        //await pruneVolumes();
        //await pruneNetworks();
        await pullImage(imageName);
        //await generateVolAndNet(projName, branchName);
        let urls = await createContainer(imageName, jobName) 

        await rmWorkdir(projName, branchName);
        res.status(200).json({projName: projName, urls: urls});
    } catch (err) {
        console.log(err);
        await pruneImages();
        await rmWorkdir(projName, branchName);
        // Will remove all unused volumes & networks 
        // (unused means if the container for this is removed then it becomes unused):
        // Not ideal to be deleted on subsequent deployments.
        //await pruneVolumes(); 
        //await pruneNetworks();
        res.status(400).json({err: `Error occured during direct deployment : \n${err.name} :- ${err.message}`});
    }
})
function buildImage(workdirpath, imageName){
    const io = require("../utilities/svsocket").getIo()
    // console.log("Building image ...")
    io.emit("message",{iomessage:"Building image...",progress:16}) //
    return new Promise( async (resolve, reject) => {
        var tarStream = tar.pack(workdirpath);
        try {
            await dockerapi.buildImage(tarStream, {t: imageName}, function (err, stream) {
              if (err) {
                console.log(err);
                return reject(new Error(`(buildImage) docker.buildImage err ${err.name} :- ${err.message}`));
              }
                dockerapi.modem.followProgress(stream, onFinished, onProgress);
                // stream is the object which just prints "IncomingMessage..."
                function onProgress(output) {
                        let keys =  Object.keys(output);
                      
                        if(keys.length>1){
                            io.emit("message",{iomessage:JSON.stringify(output),progress:0.5})
                        }else{
                            io.emit("message",{iomessage:JSON.stringify(output[keys[0]]),progress:0.5})
                        }
                      
                        
                }
                function onFinished(err, output) {
                    if (err){ // docker image build was unsuccessful.
                        io.emit("message","Docker image build was unsuccessful")
                        //console.log(err);
                        return reject(new Error(`followProgress - buildImage err: ${err}`))
                    } else {
                        // fs.writeFileSync(projName+'-dockerlogs.txt', JSON.stringify(output)
                        //     , { flags: 'w' });
                        return resolve(true);
                    }
                }
            });
        } catch(err) {
            console.log(err);
            return reject(new Error(`(buildImage) err ${err.name} :- ${err.message}`));
        }
    })
}

function pushImage(imageName){
    const io = require("../utilities/svsocket").getIo()
    // console.log("Pushing image ...")
    io.emit("message",{iomessage:"Pushing image...",progress:16})
    return new Promise( async (resolve, reject) => {
        try {
            await exec(`docker push ${imageName}`, {
                cwd: process.cwd(),
                shell: true
            }, (err,stdout,stderr) => {
                if (err){
                    console.log(err);
                    return reject(new Error(`pushImage cli err ${err}`));
                }
                if (stderr) {
                    console.log(stderr);
                    return reject(new Error(`pushImage cli stderr ${stderr}`))
                }
                return resolve(stdout);//socket.emt stdout
            });
        } catch(err) {
            console.log(err);
            return reject(new Error(`pushImage err: ${err}`));
        }
    })
}
function pruneImages(){
    const io = require("../utilities/svsocket").getIo()
    // console.log("Pruning dangling images ...")
    io.emit("message",{iomessage:"Pruning dangling images...",progress:16})
    return new Promise( async (resolve, reject) => {
        try {
            await dockerapi.pruneImages({ 
                filters: { // this is what they mean by - map[string][]string <- where first 'string' is key of JSON obj and second 'string' is value of string array of JSON obj
                    "dangling":["true"]
                }
            })
            return resolve(true)
        } catch(err) {
            console.log(err);
            return reject(new Error(`Unable to prune images: `+err));
        }
    })
}

function pruneContainers(){
    const io = require("../utilities/svsocket").getIo()
    // console.log("Pruning containers except 'registry' ...")
    io.emit("message","Pruning containers except registry...")
    return new Promise( async (resolve, reject) => {
        try {
            await dockerapi.pruneContainers({ 
                filters: { // this is what they mean by - map[string][]string <- where first 'string' is key of JSON obj and second 'string' is value of string array of JSON obj
                    "label!":["registry"] // Remove any container without the name "registry"
                }
            })
            return resolve(true)
        } catch(err) {
            console.log(err);
            return reject(new Error(`Unable to prune images: `+err));
        }
    })
}
function pullImage(imageName) {
    const io = require("../utilities/svsocket").getIo()
    /**
        When pulling images:
        - Remove the existing any projName image on local system (so that you can pull the projName image and only it stays - the one with the private registry IP)
        - Remove any existing projName containers. (Containers with the same projName cannot exist so it gives a "Conflict. The container name "/reactapp" is already in use" error anyway)
            -- I think it's better to clean up and then pull and then run container.
    */
    console.log("Pulling image...");
    io.emit("message",{iomessage:"Pulling image...",progress:16})
    return new Promise( async (resolve, reject) => {
        try {
            await dockerapi.pull(imageName, (err, stream) => {
              if (err) {
                console.log(err);
                return reject(new Error(`docker-pull err ${err.name} :- ${err.message}`))
              } else {
                  stream.on('data', (data) => 
                  {
                    io.emit("message",Buffer.from(data).toString())
                    // This is stream (access the strings via data.stream) logs
                    // console.log("pullImage: \n",String(data));//socket.emit data.stream
                  })
                  stream.on('end',(data)=> { // This event is generated when stream is end.
                    //console.log(data); // undefined.
                    return resolve(true);
                  })
                  stream.on('error', (error) => {
                    io.emit("message",error) 
                    return console.log("pullImage stream error: \n",error);
                  })
              }
            });
        } catch(err) {
            console.log(err);
            return reject(new Error(`pullImage err: ${err}`));
        }
    })
}

function createContainer(imageName, jobName){
    const io = require("../utilities/svsocket").getIo()
    // console.log("Going to run container...");
    io.emit("message",{iomessage:"Running Container...",progress:16})
    return new Promise( async (resolve, reject) => {
        try {
            let container = await dockerapi.createContainer({
              Image: imageName,
              name: jobName,
              PublishAllPorts: true
            }) 
            let containerStarted = await container.start();
            var ports = [], urls = [], containerPort = "";
            await container.inspect((err, data) => {
                if (err) throw new Error(err);
                var portBindings = data.NetworkSettings.Ports;
                //console.log("pbings: \n",portBindings);
                for (let pb in portBindings){
                    containerPort = pb;
                    ports.push(portBindings[pb][0].HostPort);
                }
                // console.log("ports: \n", ports);
                for (let p in ports){
                    urls.push(`http://${IP}:${ports[p]} (${containerPort})`);
                }
                // console.log("urls: \n", urls);
                io.emit("message",{iomessage:"Container Started...",progress:100})
                return resolve(urls);
            })
        } catch(err) {
            console.log(err);
            return reject(new Error(`createContainer err: ${err}`));
        }
    })
}
module.exports = router