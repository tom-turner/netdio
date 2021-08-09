const express = require('express');
const app = express();
const http = require('http').Server(app);
const port = process.env.port || 5000;
const { spawn, exec, fork } = require('child_process');
const fs = require('fs')
const ip = require('./lib/getIp')
const Devices = require('./lib/autoDiscovery')
const Configuration = require('./lib/configuration')

var config = new Configuration('./config/config.json')
var newId = require('./lib/getNewId') 

//sets ip & ids
config.set("device.ip", ip)
config.set("tx.id", newId)
config.set("rx.id", newId)

/* roc stuff
var txSourcePort = config.get('tx')['source'] || getNewPort()
config.set('tx.source', txSourcePort )

var transmit = fork('./lib/roc.js')
transmit.send({ type: 'startTransmit', config: config.get('tx') })
transmit.on('message', packet => console.log(packet))

var receive = fork('./lib/roc.js')
receive.send({ 
  type: config.get("rx.source") ? 'startReceive' : '',
  config: config.get("rx") 
})
receive.on('message', packet => console.log(packet))
*/

var devices = new Devices(config.configObject)

devices.listen((device) => {
	console.log(device, "joined")
})

devices.find((device) => {
	console.log(device, "joined")
})



function getNewPort(){
  var min = 10000
  var max = 49000
  var num = Math.floor(Math.random() * (max - min + 1 )) + min 
  return num.toString()
}


// Render index.ejs
//app.get('/', function (req, res) {
//  res.render('configure-tx.ejs');
//});


//
// Starting the App
//
const server = http.listen(process.env.PORT || port, function() {
  console.log('listening on *:' + port);
});