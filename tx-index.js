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

var config = new Configuration('./config/tx-config.json')

// add pm2 again

if (config.get('ip') != ip) {
    // exec(`echo ${config.rootPassword} | sudo -S ifconfig ${local.interface} ${config.ipAddress}` , (err, stdout, stderr) => {console.log(stdout)} );
    console.log("ip does not match config")
    config.set("ip", ip)
}

function rng(){
  return Math.floor(Math.random() * (max - min + 1 )) + min 
}

var source = config.get('source') || rng()
var multicastAddress = '224.0.0.1'

config.set('source', source )

var devices = new Devices(config.configObject)
devices.connect()


function rng(){
  var min = 10000
  var max = 49000
  return Math.floor(Math.random() * (max - min + 1 )) + min 
}

devices.on('ctrlMessage', (message) => {
    console.log(message)
})

// Allow User configuration
io.on('connection', (socket) => {
  console.log('user connected');
  socket.emit('config', config.configObject)

  // listens for new config
  socket.on('setConfig', (input) => {
    console.log(input)

    if (input.type == 'ip') {
      socket.emit('newConfig', input.value)
    }

    config.set(input.type, input.value)

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
  res.render('configure-tx.ejs');
});

//
// Starting the App
//
const server = http.listen(process.env.PORT || port, function() {
  console.log('listening on *:' + port);
});