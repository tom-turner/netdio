const express = require('express');
const expressLayouts = require('express-layouts')
const app = express();
const http = require('http').Server(app);
const bp = require('body-parser');
const io = require('socket.io')(http);
const { spawn } = require('child_process');
const { exec } = require('child_process');
const ip = require('./lib/getIp')
const Configuration = require('./lib/configuration')
const Devices = require('./lib/autoDiscovery')
const ChildProcess = require('./lib/childProcess')
const port = process.env.port || 5001;

app.use(bp.json())
app.use(bp.urlencoded({ extended: true }))
app.use(express.static(__dirname + '/public'));
app.use(expressLayouts);
app.set('layout', 'application');
app.set('view engine', 'ejs');

var config = new Configuration('./config/rx-config.json')
var start = new ChildProcess('receive.js')
var devices = new Devices()

if (config.get('ip') != ip) {
    // exec(`echo ${config.rootPassword} | sudo -S ifconfig ${local.interface} ${config.ipAddress}` , (err, stdout, stderr) => {console.log(stdout)} );
}


//var connectedTx = devices.get('tx')
//var connectedCtrl = devices.get('ctrl')

devices.findDevicesAndListenForNewDevices(function (device) {
  console.log("New " + device.type + " Device:" , device)
  if(device.type == 'ctrl') {
    // start comunication
  }
  if(device.type == 'tx') {
    // add to list of transmitters and start communication
  }
})  

start.childProcess(function (callback) {
  console.log("Started Child Process:", callback)
},'receive.js')


// Allow User configuration
io.on('connection', (socket) => {
  console.log('user connected');

  socket.emit('config', config.configObject)

  socket.on('volume', (input) => {
    config.debouncedSet('volume', input)
    spawn('amixer', ['set', 'Headphone', `${input}%`])
  })

  socket.on('source', async (input) => {
    await config.set('sourcePort', input)
    console.log(input)
    pm2.restart("listen")
  })

  socket.on('ip', async (input) => {
    var port = input
    await config.set('ipAddress', input)
    socket.emit('newConfig', config)
    pm2.restart('index')
  })

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  socket.on('restart', () => {
    console.log('restart')
    pm2.restart('index')
  });

});


// Render index.ejs
app.get('/', function (req, res) {
  res.render('configure-rx.ejs');
});


//
// Starting the App
//
const server = http.listen(process.env.PORT || port, function() {
  console.log('listening on *:' + port);
});
