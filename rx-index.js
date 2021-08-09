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

var config = new Configuration('./config/rx-config.json', 'rx')

console.log(ip)

if (config.get('ip') != ip) {
    // exec(`echo ${config.rootPassword} | sudo -S ifconfig ${local.interface} ${config.ipAddress}` , (err, stdout, stderr) => {console.log(stdout)} );
    console.log("ip does not match config")
    config.set("ip", ip)
}

var devices = new Devices(config.configObject)
devices.connect()

var receive = fork('./lib/roc.js')

receive.send({ 
  type: config.get("source") ? 'startReceive' : '',
  config: config.config() 
})
receive.on('message', packet => console.log(packet))


devices.on('ctrlMessage', (message) => {
    console.log(message)
    config.set(message.type, message.value)
    if (message.type == 'source') {
      receive.send({ type: 'end'})
      receive.send({ type: 'startReceive', config: config.config() })
    }

    if (message.type == 'volume') {
      console.log(process.platform === 'linux')
      if (process.platform === 'linux') {
        exec(`amixer set Master ${message.value}%`)
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

  socket.on('volume', (message) => {
	console.log(message.value)
    config.set('volume' , message.value)
    if (process.platform === 'linux') {
	console.log(`amixer set Master ${message.value}%`)
        exec(`amixer set Master ${message.value}%`)
    }
  })

  socket.on('source', (input) => {
    console.log(input)
    config.set('source', input)
    receive.send({ type: 'end'})
    receive.send({ type: 'startReceive', config: config.config() })
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
    receive.send({ type: 'end'})
    receive.send({ type: 'startReceive', config: config.config() })
    socket.emit('config', config.configObject)
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
