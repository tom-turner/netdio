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
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist'));
app.use(expressLayouts);
app.set('layout', 'application');
app.set('view engine', 'ejs');

var config = new Configuration('./config/rx-config.json')

// We can just use `fork()` instead of pm2, it provides a way for use to
// send data to the child_process!
//var receive = fork('./child_processes/receive.js')
//receive.send({ type: 'start', config: config.config() })
//receive.on('message', packet => console.log(packet))

if (config.get('ip') != ip) {
    // exec(`echo ${config.rootPassword} | sudo -S ifconfig ${local.interface} ${config.ipAddress}` , (err, stdout, stderr) => {console.log(stdout)} );
    console.log("ip does not match config")
    config.set("ip", ip)
}

var devices = new Devices(config.configObject)
devices.connect()


devices.on('ctrlMessage', (message) => {
    console.log(message)
    config.set(message.type, message.value)
    if (message.type == 'source') {
      // restart roc with source
    }

    if (message.type == 'volume') {
      console.log(process.platform === 'linux')
      if (process.platform === 'linux') {
        spawn('amixer', ['set', 'Headphone', `${input}%`])
      }
    }     
})

// Allow User configuration
io.on('connection', (socket) => {
  console.log('user connected');
  socket.emit('devices', devices.getDevices())
  socket.emit('config', config.configObject)


  devices.on('connection', (device) => {
    socket.emit('devices', devices.getDevices())
  })

    devices.on('disconnect', (device) => {
    socket.emit('devices', devices.getDevices())
  })

  socket.on('volume', (input) => {
    config.set('volume' , input.value)
    if (process.platform === 'linux') {
        spawn('amixer', ['set', 'Headphone', `${input}%`])
    }
  })

  socket.on('source', (input) => {
    config.set('source', input)
    // restart roc with new source
  })


  // listens for new config
  socket.on('setConfig', (input) => {
    console.log(input)

    if (input.type == 'ip') {
      socket.emit('newConfig', input.value)
    }

    config.set(input.type , input.value)

  })

  socket.on('restart', () => {
    console.log('restart')
    //pm2.restart('rx-index')

  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
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
