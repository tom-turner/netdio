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
const Logs = require("./lib/logs")
const port = process.env.port || 5000;

app.use(bp.json())
app.use(bp.urlencoded({ extended: true }))
app.use(express.static(__dirname + '/public'));
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist'));
app.use(expressLayouts);
app.set('layout', 'application');
app.set('view engine', 'ejs');


var config = new Configuration('./config/ctrl-config.json')
var logs = new Logs()

logs.write("application started")



if (config.get('ip') != ip) {
    // exec(`echo ${config.rootPassword} | sudo -S ifconfig ${local.interface} ${config.ipAddress}` , (err, stdout, stderr) => {console.log(stdout)} );
    console.log("ip does not match config")
    config.set("ip", ip)
}

var devices = new Devices(config.configObject)
devices.connect()


/* - Just console.logs connections/disconnections
devices.on('connection', (device) => {
  console.log("Connected Devices:", devices.getDevices())
})

devices.on('disconnect', (device) => {
  console.log("Connected Devices:", devices.getDevices())
})

devices.on('message', (message) => {
  console.log(message)
})
*/

// Allow User configuration
io.on('connection', (socket) => {
  console.log('user connected');
  socket.emit('config', config.configObject)
  socket.emit('devices', devices.getDevices())  


  devices.on('connection', (device) => {
    socket.emit('devices', devices.getDevices())
  })

  devices.on('disconnect', (device) => {
    socket.emit('devices', devices.getDevices())
  })


  // listens for new config
  socket.on('config', (newConfig) => {
    config.set('name', newConfig.name)
    config.set('ip', newConfig.ip)
    socket.emit('newConfig', config.configObject)
  })


  socket.on('restart', () => {
    console.log('restart')
    process.exit()
    pm2.restart('ctrl-index')
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  socket.on('forward', (message) =>{
    console.log("forward:",message)
    devices.forward(message.ip, message)
  } )

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
