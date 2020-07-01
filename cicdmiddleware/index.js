const http = require("http");
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const socketio = require("socket.io");
const config = require("config")
const app = express();
// const timeout = require("connect-timeout");
// app.use(timeout(1200000))
app.use(bodyParser.json())
app.use(cors())

app.use('/integrate', require('./routes/integrate'));
app.use('/deploy', require('./routes/deploy'));
app.use('/showLogs', require('./routes/showLogs'));

app.use('/deployDirectly', require('./routes/deployDirectly'));
app.use('/showDeployLogs', require('./routes/showDeployLogs'));
app.use('/getDeployUrl',require("./routes/getDeployURL"))

if(!config.get("jwtPrivateKey")){
    console.error("FATAL error: Jwt key not defined...");
    process.exit(1);
  }

const server = http.createServer(app);
const io = socketio(server);


//  const getIoInstance = ()=>{
//     return io;
// }
require("./utilities/svsocket").setIo(io);

server.listen(5003, () => { 
    console.log("listening at 5003");
})

