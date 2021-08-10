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

var config = new Configuration('./config/config.json')
var newId = require('./lib/getNewId')

app.use(bp.json())
app.use(bp.urlencoded({ extended: true }))
app.use(express.static(__dirname + '/public'));
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist'));
app.use(expressLayouts);
app.set('layout', 'application');
app.set('view engine', 'ejs'); 

// sets ip
config.set("device.ip", ip)

// roc stuff
if (config.get('tx')) {
  var txSourcePort = config.get('tx')['source'] || getNewPort()
  config.set('tx.source', txSourcePort )

  var transmit = fork('./lib/roc.js')
  transmit.send({ type: 'startTransmit', config: config.get('tx') })
  transmit.on('message', packet => console.log(packet))
}

var receive = fork('./lib/roc.js')
var startRx = config.get("rx")["source"] ? 'startReceive' : '' ;
receive.send({ type: startRx , config: config.get("rx") })
receive.on('message', packet => console.log(packet))


// discovery stuff
var devices = new Devices(config.configObject)

devices.listen((device) => {
	console.log(device, "joined")
})


devices.find((device) => {
  console.log(device, "was found")
})  


devices.on('ctrlMessage', (message) => {
    console.log(message)
    config.set(message.type, message.value)

    if (message.type == 'rx.source') {
      receive.send({ type: 'end'})
      receive.send({ type: 'startReceive', config: config.get('rx') })
    }

    if (message.type == 'rx.volume' && process.platform === 'linux') {
        exec(`amixer set Master ${message.value}%`)
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

function getNewPort(){
  var min = 10000
  var max = 49000
  var num = Math.floor(Math.random() * (max - min + 1 )) + min 
  return num.toString()
}

//
// Starting the App
//
const server = http.listen(process.env.PORT || port, function() {
  console.log('listening on *:' + port);
});