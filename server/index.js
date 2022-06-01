require('dotenv').config()
const port = process.env.PORT || 5000;

const express = require('express');
const app = express();
const http = require('http').Server(app);
const bp = require('body-parser');
const config = require('./lib/config')();
const setup = require('./lib/setup')(config);
const bonjour = require('./lib/bonjour')(config, 1000)
const control = require('./lib/control')


bonjour.receive('discovery', (device) => {
  return 
})

bonjour.receive('ctrl message', (message) => {
  config.set( message.type , message.value)
  control.router(message, config, bonjour)
  return
})






//
// Starting the App
//
const server = http.listen(port, function() {
  console.log('listening on *:' + port);
});