const express = require('express');
const path = require('path');
// ^ Make sure to import proxy module, keeping this line before body-parser (there was some issue raised with solution like this mentioned)
const { createProxyMiddleware } = require('http-proxy-middleware'); 
const bodyParser = require('body-parser');
const cors = require('cors');
//const IP = require('ip').address();
const app = express();
const port = 8080;

app.use(bodyParser.json())
app.use(cors())

app.use(express.static(path.join(__dirname,'build')));
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname,'build'));
});
//console.log(IP);
/**
 * Below proxy middleware has been attached so that
 * any routes that hit this webserver will be parsed by
 * the api server of which I have given the domain in "target" key.
 *  */ 
app.use(
  "/",
  createProxyMiddleware(
    {
      target: `http://0.0.0.0:32768/`,
      changeOrigin: true,
      logLevel: "debug",
      onProxyReq: (proxyReq, req, res) => {
        if (req.body){
          let bodyData = JSON.stringify(req.body);
          // incase if content-type is application/x-www-form-urlencoded -> we need to change to application/json
          proxyReq.setHeader('content-type','application/json');
          //proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
          // stream the content
          proxyReq.write(bodyData);
        } else {
          console.log("No POST body received.");
        }
      }
    }
  )
)

app.listen(port, () => {
    console.log("listen on "+port+" port")
});
