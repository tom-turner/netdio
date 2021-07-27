const express = require('express');
const expressLayouts = require('express-layouts')
const app = express();
const http = require('http').Server(app);
const bp = require('body-parser');
const io = require('socket.io')(http);
const { spawn, exec, fork } = require('child_process');
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

var config = new Configuration('./config/rx-config.json')

// We can just use `fork()` instead of pm2, it provides a way for use to
// send data to the child_process!
var receive = fork('./child_processes/receive.js')
receive.send({ type: 'start', config: config.config() })
receive.on('message', packet => console.log(packet))


if (config.get('ip') != ip) {
    // exec(`echo ${config.rootPassword} | sudo -S ifconfig ${local.interface} ${config.ipAddress}` , (err, stdout, stderr) => {console.log(stdout)} );
}

var devices = new Devices(config.config())
devices.connect()

  var connectedDevices = [];

  devices.on('connection', (device) => {
    connectedDevices.push(device.config)
    console.log("Connected Devices:", connectedDevices)
  })

  devices.on('disconnect', (device) => {
    connectedDevices = connectedDevices.filter((element) => {
      return !(element.ip == device.config.ip)
      console.log("Connected Devices:", connectedDevices)
    })
  })

  devices.on('message', (message) => {
    console.log(message)
  })



// Allow User configuration
io.on('connection', (socket) => {
  console.log('user connected');
  socket.emit('config', config.configObject)
  socket.emit('devices', connectedDevices)

  devices.on('connection', (device) => {
    socket.emit('devices', connectedDevices)
  })



  // listens for new config
  socket.on('config', (newConfig) => {
    config.set('name', newConfig.name)
    config.set('ip', newConfig.ip)
    socket.emit('newConfig', config.configObject)

  })

  socket.on('restart', () => {
    console.log('restart')
    //pm2.restart('ctrl-index')

  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  socket.on('forward', (message) =>{
    console.log(message)
   // devices.emit(message.ip, message)
  } )

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
