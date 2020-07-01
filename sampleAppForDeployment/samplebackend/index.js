const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 5000;

app.use(bodyParser.json())
app.use(cors())

app.get('/', (req,res) => {
    res.send("API SERVER")
})
app.post('/takeData', (req,res) => {
    try {   
        const msg = req.body.msg;
        console.log("client msg was: ", msg);
        res.status(200).send(`${msg}-${Math.random()}`);
    }catch(e) {
        res.status(400).send(e);
    }
})

app.get('/hello', function(req, res) {
    res.status(200).send("HELLO FRIEND");
})

app.post('/newRequiredRouteAfterDeployment', (req, res) => {
    try {
        const frontendmsg  = req.body.newdata;     
        res.status(200).send(`${frontendmsg} \n Date right now is: ${new Date(Date.now()).toLocaleTimeString('en-US', {hour12: true})}`)
    } catch (err) {
        res.status(400).send(e);
    }
})

app.listen(port, () => {
    console.log("listen on "+port+" port")
});