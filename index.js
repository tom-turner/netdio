const express = require('express');
const app = express();
const http = require('http').Server(app);
const port = process.env.port || 5000;
const fs = require('fs')

const ip = require('./lib/getIp')
const Devices = require('./lib/autoDiscovery')
const Configuration = require('./lib/configuration')

var services = new Configuration('./config/services.json')

console.log(services.set("device",ip)['ip'])


function rng(){
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