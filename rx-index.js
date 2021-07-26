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

var devices = new Devices(config.config())

if (config.get('ip') != ip) {
    // exec(`echo ${config.rootPassword} | sudo -S ifconfig ${local.interface} ${config.ipAddress}` , (err, stdout, stderr) => {console.log(stdout)} );
}

//get list of devices on the network
devices.startListening( (device) => {
  console.log("device joined:", device)
})

devices.pingDevices( (device) => {
  console.log("device found:", device)
})

// Allow User configuration
io.on('connection', (socket) => {
  console.log('user connected');

  socket.emit('config', config.config())

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
    await config.set('ipAddress', input)
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
