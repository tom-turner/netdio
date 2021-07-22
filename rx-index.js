const express = require('express');
const expressLayouts = require('express-layouts')
const app = express();
const http = require('http').Server(app);
const bp = require('body-parser');
const io = require('socket.io')(http);
const { spawn } = require('child_process');
const { exec } = require('child_process');
const pm2 = require('pm2')
const fs = require('fs');
var net = require('net'),
JsonSocket = require('json-socket');
const Configuration = require('./lib/configuration')
const port = process.env.port || 5000;

app.use(bp.json())
app.use(bp.urlencoded({ extended: true }))
app.use(express.static(__dirname + '/public'));
app.use(expressLayouts);
app.set('layout', 'application');
app.set('view engine', 'ejs');

var unitConfig = new Configuration('./config/rx-config.json')
var networkConfig = getNetworkConfig()
var rootPassword = unitConfig.rootPassword

if (unitConfig.get('ipAddress') != networkConfig.ip) {
  console.log('IP does not match config file -', 'Configured IP: ' + unitConfig.get('ipAddress'), '- Actual IP Address: ' + networkConfig.ip )
  //set IP address and restart process
 // exec(`echo ${unitConfig.rootPassword} | sudo -S ifconfig ${networkConfig.interface} ${unitConfig.ipAddress}` , (err, stdout, stderr) => {console.log(stdout)} );
 // pm2.restart('index')
}

var deviceList = []

var testPort = 20010
var connectPort = 20000

var discover = net.createServer();
discover.listen(testPort)
discover.on('connection', function(socket){
  socket = new JsonSocket(socket) 
  socket.on('message', function(message) {
    console.log("ping: ", message.server.ipAddress)
    deviceList.push(message)
  })
})

setInterval(function(){
  var connectedClients = []

  if (deviceList != connectedClients){

 for (var device of deviceList) {
  connectedClients.push(device)
   // start stream to server as a client
  }
}

}, 1000)
 


// start application
pm2.connect(function(err) {
  if (err) {
    console.error(err)
    process.exit(2)
  }
  // start listen.js
  pm2.start({
    script    : 'child_processes/receive.js',
    name      : 'rx'
  }, function(err, apps) {
    console.log("receive.js started")
    if (err) {
      console.error(err)
    }
  })
    // listen for restart me
    pm2.launchBus((err, bus) => {
      bus.on('process:msg', (packet) => {
        console.log(packet.data.message)
        pm2.restart('listen') 
      })
    })
  })

// Allow User configuration
io.on('connection', (socket) => {
  console.log('user connected');

  socket.emit('config', unitConfig.configObject)

  socket.on('volume', (input) => {
    unitConfig.debouncedSet('volume', input)
    spawn('amixer', ['set', 'Headphone', `${input}%`])
  })

  socket.on('source', async (input) => {
    await unitConfig.set('sourcePort', input)
    console.log(input)
    pm2.restart("listen")
  })

  socket.on('ip', async (input) => {
    var port = input
    await unitConfig.set('ipAddress', input)
    socket.emit('newConfig', unitConfig)
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

// check if unit ip is configured correctly
function getNetworkConfig(){

  var eth = 'eth0';
  var wlan = 'wlan0';
  var networkConfig = {
    ip: 'n/a',
    interface: 'n/a',
    subnetMask: '255.255.0.0'
  }

  try {
    var ip = require('local-ip')(eth);
    networkConfig.ip = ip
    networkConfig.interface = eth
    return networkConfig
  }
  catch {
    try {
      var ip = require('local-ip')(wlan)
      networkConfig.ip = ip
      networkConfig.interface = wlan
      return networkConfig
    }
    catch {
      console.log("Could not get local ip") 
      return networkConfig
    }
  }
}

// Render index.ejs
app.get('/', function (req, res) {
  res.render('configure-rx.ejs');
});


//
// Starting the App
//
const server = http.listen(process.env.PORT || 5000, function() {
  console.log('listening on *:5000');
});
