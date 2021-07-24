const express = require('express');
const expressLayouts = require('express-layouts')
const app = express();
const http = require('http').Server(app);
const bp = require('body-parser');
const io = require('socket.io')(http);
const { spawn } = require('child_process');
const { exec } = require('child_process');
const Configuration = require('./lib/configuration')
const Devices = require('./lib/autoDiscovery')
const ChildProcess = require('./lib/childProcess')
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

var start = new ChildProcess('receive.js')
var devices = new Devices(config)


//get list of devices on the network
devices.startListening( (device) => {
  console.log("device joined:", device)
})

devices.pingDevices( (device) => {
  console.log("device found:", device)
})


start.childProcess(function (childProcess) {
    console.log("Started Child Process:", childProcess)
})


// Allow User configuration
io.on('connection', (socket) => {
  console.log('user connected');

  socket.emit('config', configFile.configObject)

  socket.on('volume', (input) => {
    configFile.debouncedSet('volume', input)
    spawn('amixer', ['set', 'Headphone', `${input}%`])
  })

  socket.on('source', async (input) => {
    await configFile.set('sourcePort', input)
    console.log(input)
    pm2.restart("listen")
  })

  socket.on('ip', async (input) => {
    var port = input
    await configFile.set('ipAddress', input)
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
