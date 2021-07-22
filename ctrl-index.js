const express = require('express');
const expressLayouts = require('express-layouts')
const app = express();
const http = require('http').Server(app);
const bp = require('body-parser');
const io = require('socket.io')(http);
const { spawn } = require('child_process');
const { exec } = require('child_process');
const pm2 = require('pm2')
const find = require('local-devices');
const fs = require('fs');
var net = require('net'),
  JsonSocket = require('json-socket');
var socket = new JsonSocket(new net.Socket());
const port = process.env.port || 5000;

app.use(bp.json())
app.use(bp.urlencoded({ extended: true }))
app.use(express.static(__dirname + '/public'));
app.use(expressLayouts);
app.set('layout', 'application');
app.set('view engine', 'ejs');

var unitConfig = getUnitConfig()
var networkConfig = getNetworkConfig()
var rootPassword = unitConfig.rootPassword
var networkDevices = [];
var testPort = 20010
var connectPort = 20000
var connection = net.createServer();

connection.listen(connectPort);
connection.on('connection', function(socket) {
  socket = new JsonSocket(socket)

  // send messages to devices here

  socket.on('message', function(message){
    console.log(message)
  })
})


if (unitConfig.ipAddress != networkConfig.ip) {
  console.log('IP does not match config file -', 'Configured IP: ' + unitConfig.ipAddress, '- Actual IP Address: ' + networkConfig.ip )
  //set IP address and restart process
  // exec(`echo ${unitConfig.rootPassword} | sudo -S ifconfig ${networkConfig.interface} ``${unitConfig.ipAddress}` , (err, stdout, stderr) => {console.log(stdout)} ``);
  // pm2.restart('index')
}

var listOfConnectedDevices = []

// continuously search for devices on the network
setInterval( function() {

  find().then(devices => {

    // listOfConnectedDevices = [];

    for ( var device of devices ) {
    
        JsonSocket.sendSingleMessageAndReceive(testPort, device.ip, { active: true, ip: unitConfig.ipAddress}, function(err, message) {
          if (err) {}

          try {

            if (message.active) {


            

              listOfConnectedDevices.pushIfNotExist( message.unitConfig , function(e) { 
              return e.name === element.name && e.text === element.text; 
              });

            }

          } catch {}

        })
    }
  })
}, 1000)




// gets message and responds 


// Allow User configuration
io.on('connection', (socket) => {
  console.log('user connected');
  socket.emit('config', unitConfig)
  
  setInterval( function() {
    socket.emit('devices', listOfConnectedDevices)
  },1000)

  socket.on('volume', (input) => {
    unitConfig.volume = input
    spawn('amixer', ['set', 'Headphone', `${input}%`])
  })

  socket.on('source', (input) => {
    unitConfig.sourcePort = input
    console.log(input)
    saveConfig()
    pm2.restart("listen")
  })

  socket.on('ip', (input) => {
    var port = input
    unitConfig.ipAddress = input
    saveConfig()
    socket.emit('newConfig', unitConfig)
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

// read config file & restore config on error
function getUnitConfig(){
  try {
    var file = fs.readFileSync('config/config.json'), unitConfig
    return JSON.parse(file);
  }
  catch (err) { 
    console.log('Restoring from backup file: ', err)
    spawn('cp', ["-R", "config/backupconfig.json", "config/config.json"])
    pm2.restart('index')
  }
}

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


function saveConfig() {

  var data = JSON.stringify(unitConfig);

  fs.writeFile('./config/config.json', data, function (err) {
    if (err) {
      console.log('There has been an error saving your configuration data.');
      console.log(err.message);
      return;
    }
    console.log('Configuration saved successfully.')
  });
  return 
}


Array.prototype.inArray = function(comparer) { 
    for(var i=0; i < this.length; i++) { 
        if(comparer(this[i])) return true; 
    }
    return false; 
}; 

Array.prototype.pushIfNotExist = function(element, comparer) { 
    if (!this.inArray(comparer)) {
        this.push(element);
    }
}; 




// Render index.ejs
app.get('/', function (req, res) {
  res.render('configure-ctrl.ejs');
});


//
// Starting the App
//
const server = http.listen(process.env.PORT || 5000, function() {
  console.log('listening on *:5000');
});
