const express = require('express');
const expressLayouts = require('express-layouts')
const app = express();
const http = require('http').Server(app);
const bp = require('body-parser');
const io = require('socket.io')(http);
const { spawn } = require('child_process');
const { exec } = require('child_process');
const pm2 = require('pm2')
const ip = require('./lib/getIp')
const Configuration = require('./lib/configuration')
const Devices = require('./lib/autoDiscovery')
const port = process.env.port || 5000;

app.use(bp.json())
app.use(bp.urlencoded({ extended: true }))
app.use(express.static(__dirname + '/public'));
app.use(expressLayouts);
app.set('layout', 'application');
app.set('view engine', 'ejs');

var configFile = new Configuration('./config/rx-config.json')
var config = {
  name : configFile.get('name'),
  type : configFile.get('type'),
  ip : configFile.get('ip')
}

var devices = new Devices(config)

if (config.ip != ip) {
    // exec(`echo ${config.rootPassword} | sudo -S ifconfig ${local.interface} ${config.ipAddress}` , (err, stdout, stderr) => {console.log(stdout)} );
}


devices.listenForNewDevices( (device) => {
  console.log("New " + device.type + " Device:" , device)

  if ( device.type == 'tx') {

  }

  if ( device.type == 'rx') {
    
  }

})


// Allow User configuration
io.on('connection', (socket) => {
  console.log('user connected');
  socket.emit('config', config.configObject)
  
  setInterval( function() {
    socket.emit('devices', listOfConnectedDevices)
  },1000)

  socket.on('volume', (input, device) => {
    // send input to device
    spawn('amixer', ['set', 'Headphone', `${input}%`])
  })

  socket.on('source', (input, device) => {
    // send input to device
    saveConfig()
    pm2.restart("listen")
  })

  socket.on('ip', (input, device) => {
    var port = input
    // send input to device
    saveConfig()
    socket.emit('newConfig', config.configObject)
    pm2.restart('index')
  })

  socket.on('restart', () => {
    console.log('restart')
    pm2.restart('index')
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

});


// Render index.ejs
app.get('/', function (req, res) {
  res.render('configure-ctrl.ejs');
});

//
// Starting the App
//
const server = http.listen(process.env.PORT || port, function() {
  console.log('listening on *:' + port);
});
