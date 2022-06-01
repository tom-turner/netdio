require('dotenv').config()
const port = process.env.PORT || 5000;
const updateInterval = 1000
const express = require('express');
const app = express();
const http = require('http').Server(app);
const bp = require('body-parser');
const config = require('./lib/config')();
const setup = require('./lib/setup')(config);
const { Discovery } = require('./lib/networkServices')
const control = require('./lib/control')

Discovery.publish()
Discovery.find()


app.get('/', async (req, res) => {
  res.send( Discovery.getDeviceList() )
});

app.get('/get-config', async (req, res) => {
  res.send(config.configObject);
});


//
// Starting the App
//
const server = http.listen(port, function() {
  console.log('listening on *:' + port);
});