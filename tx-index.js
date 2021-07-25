const express = require('express');
const expressLayouts = require('express-layouts')
const app = express();
const http = require('http').Server(app);
const bp = require('body-parser');
const io = require('socket.io')(http);
const { fork } = require('child_process');
const pm2 = require('pm2')
const Configuration = require('./lib/configuration')

app.use(bp.json())
app.use(bp.urlencoded({ extended: true }))
app.use(express.static(__dirname + '/public'));
app.use(expressLayouts);
app.set('layout', 'application');
app.set('view engine', 'ejs');

var config = new Configuration('./config/tx-config.json')
var networkConfig = getNetworkConfig()

console.log(config.config())

if (config.get('ip') != networkConfig.ip) {
  console.log('IP does not match config file -', 'Configured IP: ' + config.get('ip'), '- Actual IP Address: ' + networkConfig.ip )
  //set IP address and restart process
  //exec(`echo ${unitConfig.rootPassword} | sudo -S ifconfig ${networkConfig.interface} ${unitConfig.ipAddress}` , (err, stdout, stderr) => {console.log(stdout)} );
  //pm2.restart('index')
}

var transmit = fork('./child_processes/transmit.js')
transmit.send({ type: 'start', config: config.config() })
transmit.on('message', packet => console.log(packet))

// Allow User configuration
io.on('connection', (socket) => {
  console.log('user connected');

  socket.emit('config', config.config())

  socket.on('source', (input) => {
    config.set('destPort', input)
    console.log(input)
    pm2.restart("transmit")
  })

  socket.on('ip', (input) => {
    config.set('ipAddress', input.ipAddress)
    config.set('rxIp', input.rxIp)
    socket.emit('newConfig', config.config())
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
  res.render('configure-tx.ejs');
});


//
// Starting the App
//
const server = http.listen(process.env.PORT || 5001, function() {
  console.log('listening on *:5000');
});
