const express = require('express');
const expressLayouts = require('express-layouts')
const fileUpload = require('express-fileupload');
const app = express();
const http = require('http').Server(app);
const bp = require('body-parser');
const io = require('socket.io')(http);
const { spawn, exec, fork } = require('child_process');
const ip = require('./lib/getIp')
const Configuration = require('./lib/configuration')
const Devices = require('./lib/autoDiscovery')
const Color = require('./lib/color')
const Player = require('./lib/player')
const player = new Player
const port = process.env.port || 5000;
const fs = require('fs')
const Roc = require('./lib/roc')
const multer  = require('multer')
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images/')
  },
  filename: (req, file, cb) => {
    cb( null, 'logo')
  }
})
const upload = multer({ storage: storage })
require('./lib/fileCheck')
exec('python ./lib/python/ledOn.py')
app.use(bp.json())
app.use(bp.urlencoded({ extended: true }))
app.use(express.static(__dirname + '/public'));
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist'));
app.use(expressLayouts);
app.set('layout', 'application');
app.set('view engine', 'ejs'); 

/*
try {
  exec('git pull')
} catch(e) {
  console.log(e)
}
*/

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
    type: 'keepalive',
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
  

    switch (message.type) {
      case 'source':
        config.set( message.type , message.value)
        roc.kill(roc.get('rx'))
        console.log(config.get('source'))
        roc.rocRecv(config.get('source'))
      break
      case 'keepalive' :
        roc.rocSend(message.value)
      break
      case 'rx.volume':
        config.set( message.type , message.value)
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
  console.log('user connected', socket.id);
  socket.emit('devices', devices.getDevices())  
  socket.emit('trackData', player.getCurrentTrack())

  devices.on('connection', (device) => {
    socket.emit('devices', devices.getDevices())
  })

  devices.on('disconnect', (device) => {
    socket.emit('devices', devices.getDevices())
  })

  socket.on('forward', (message) =>{
    devices.forward(message.ip, message)
  })

  socket.on('reload', () => {
    console.log('reload')
    exec('python ./lib/python/ledOff.py')
    roc.kill(roc.get())
    process.exit()
  });

  socket.on('reboot', () => {
    console.log('rebooting')
    process.exit()
    exec('sudo reboot')
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
  player.on('trackData', () => {
    socket.emit('trackData', player.getCurrentTrack())
  });
});

app.post('/configure', upload.single('file'), (req, res, next) => {
  const color = new Color()
  console.log(1, req.body)

  config.set("device.color", req.body.color)
  config.set("device.colordark", color.darken(req.body.color))
  config.set("device.ip", req.body.ip)
  config.set("device.name", req.body.name)

  return res.json('Configuration Received')
})

app.post('/playerctrl', (req,res) => {
  let message = req.body.message
  message.transport ? player[message.transport]() : ''
  message.service ? player.changeTo(message.service) : ''
  return res.json(req.body.message)
})

// Routes
app.get('/', async (req, res) => {
  res.render('user.ejs', {config: config.configObject});
});
app.get('/settings', (req, res) => {
  res.render('settings.ejs', {config: config.configObject});
});
app.get('/player', (req, res) => {
  res.render('player.ejs', {config: config.configObject});
});


//
// Starting the App
//
const server = http.listen(process.env.PORT || port, function() {
  console.log('listening on *:' + port);
});