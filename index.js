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
const fs = require('fs')
const Roc = require('./lib/roc')
require('./lib/fileCheck')
exec('python ./lib/python/ledOn.py')

app.use(bp.json())
app.use(bp.urlencoded({ extended: true }))
app.use(express.static(__dirname + '/public'));
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist'));
app.use(expressLayouts);
app.set('layout', 'application');
app.set('view engine', 'ejs'); 

// config
let config = new Configuration('./config/config.json')
config.set("device.ip", ip)

config.get('device')['id']
  ? config.get('device')['id']
  : config.set("device.id", config.hash(ip))
let id = config.get('device')['id']

config.get('tx') ?
  config.get('tx')['source'] 
  ? console.log( "running tx source", config.get('tx')['source'] ) 
  : config.set( "tx.source", config.getNewPort() )
: console.log('no tx')


// audio
let roc = new Roc(config.configObject)
roc.rocRecv()
setInterval(()=>{ 
    devices.forward( config.get('source')['send'], {
    type: 'devices',
    value: config.get('source')
  })
}, 1000)


// auto discover devices on the network
var devices = new Devices(config.configObject)
devices.listen()
devices.find()  

devices.on('connection', (device) => {
  console.log(device, "joined")
})

devices.on('disconnect', (device) => {
  console.log(device, "left")
})

devices.on('ctrlMessage', (message) => {
  config.set( message.type , message.value)

    switch (message.type) {
      case 'source':
        roc.kill(roc.get('rx'))
        console.log(config.get('source'))
        roc.rocRecv(config.get('source'))
      break
      case 'devices' :
        roc.rocSend(message.value)

      break
      case 'volume':
        process.platform === 'linux' ? exec(`amixer set Master ${message.value}%`) : ''
      break
      case 'blink':
        exec('python ./lib/python/blink.py')
        setTimeout( () => {
            exec('python ./lib/python/ledOn.py')
        }, 6000 )
      break
    }

})

// Allow User configuration
io.on('connection', (socket) => {
  console.log('user connected');
  socket.emit('devices', devices.getDevices())  

  devices.on('connection', (device) => {
    socket.emit('devices', devices.getDevices())
  })

  devices.on('disconnect', (device) => {
    socket.emit('devices', devices.getDevices())
  })

  socket.on('forward', (message) =>{
    console.log("forward:",message)
    devices.forward(message.ip, message)
  })

  socket.on('restart', () => {
    console.log('restart')
    exec('python ./lib/python/ledOff.py')
    roc.kill(roc.get())
    process.exit()
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

});

// Render index.ejs
app.get('/', function (req, res) {
  res.render('user.ejs');
});
app.get('/config', function (req, res) {
  res.render('config.ejs', {config: config.configObject});
});


//
// Starting the App
//
const server = http.listen(process.env.PORT || port, function() {
  console.log('listening on *:' + port);
});