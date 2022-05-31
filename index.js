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
const Devices = require('./lib/devices')
const Color = require('./lib/color')
const Spotify = require('./lib/spotify')
const platform = require('./lib/platform')
const EQ = require('./lib/eq')
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

// config
let updateInterval = 1000 // lower means faster communcation between devices but inceased CPU useage
let config = new Configuration('./config/config.json')
config.set("device.ip", ip)

config.get('device')['id']
  ? config.get('device')['id']
  : config.set("device.id", config.hash(ip))
let id = config.get('device')['id']

config.get('tx') 
  ? config.get('tx')['source'] 
    ? console.log( "running tx source", config.get('tx')['source'] ) 
    : config.set( "tx.source", config.getNewPort() )
  : console.log('no tx')

// Network audio stuff
let roc = new Roc(config.configObject, updateInterval)
let eq = new EQ()

config.get('rx')
  ? roc.rocRecv(config.get('source'))
  : console.log('no rx')

setInterval(()=>{ 
  let message = {
    type: 'devices',
    value: config.get('source')
  }
  devices.forward('ctrl message', config.get('source')['send'], message, (res) => {
        if (res.error) {
          config.set('source', {
            "send":"undefined",
            "socket":"muted",
            "name":"-Mute-",
            "recv":config.get('device')['id'],
            "txdata":{
              "tx":{
                "name":"-Mute-",
                "source":"muted"
              }
            }
          })
          return console.log('could not find input on network',res.error)
        }
  })
}, updateInterval / 2)


// auto discover devices on the network and receive messages
let devices = new Devices(config, updateInterval)
devices.receive('discovery', (device) => {
  return 
})
devices.receive('ctrl message', (message) => {
  //console.log("tx data", message.value.txdata)
  config.set( message.type , message.value)
  //console.log(message)
  switch (message.type) {
    case 'source':
    roc.kill(roc.get('rx'))
    roc.rocRecv(config.get('source'))
    //console.log('recv',config.get('source'))
    break
    case 'devices' :
    message.value.send = devices.getDeviceIp(message.value.send)
    message.value.recv = devices.getDeviceIp(message.value.recv)
    console.log(message.value.recv)
    roc.rocSend(message.value)
    break
    case 'rx.volume':
    process.platform === 'linux' ? exec(`amixer -q sset Digital ${message.value}%`) : ''
    break
    case 'blink':
    exec('python ./lib/python/blink.py')
    setTimeout( () => {
      exec('python ./lib/python/ledOn.py')
    }, 6000 )
    break
  }
  return
})


// spotify stuff
let spotifyConfig = { 
    priority : process.platform == 'linux' ? Math.random().toString().slice(-6) : 0,
    device: JSON.stringify({
      id: config.get('device')['id'],
      ip: config.get('device')['ip'],
      name: 'Duckado-Connect'
    })
  } 
let spotify = new Spotify(updateInterval)
let spotifyService = devices.publish('duck-spot', spotifyConfig)
let findSpotify = devices.discover('duck-spot')
let spotifyServices = []
let i = 0
let spotifyPing = setInterval(()=>{
  spotifyServices = findSpotify.services.sort((a,b) => {
    return a.txt.priority < b.txt.priority
  })
  let currentSpotifyService = spotifyServices[i]

  if(!currentSpotifyService){
    console.log('no spotify services')
    devices.removeDevice({device: {id: config.hash('spotify')}})
    i = 0
    return
  }

  let isCurrentService = currentSpotifyService.txt.device === spotifyConfig.device

  if(isCurrentService){
    console.log('i am the spotifyPlayer')
    spotifyConfig.player = JSON.stringify({
      name:"Spotify Connect",
      type:"tx",
      driver:"alsa",
      hardware:"dsnoop:Loopback,1,0",
      source: config.getNewPort()
    })
  }

  let spotifyPlayer = {
    device: currentSpotifyService.txt.device ? JSON.parse(currentSpotifyService.txt.device) : '',
    tx: currentSpotifyService.txt.player ? JSON.parse(currentSpotifyService.txt.player) : ''
  }

  devices.forward('spotify', currentSpotifyService.name, 'keep alive', (res) => {
    if(res.error){ 
      i = i + 1
      console.log('error connecting to spotify device', res.error)
      return
     }
    //console.log("spotify ip", spotifyPlayer.device.ip)
    devices.addDeviceAndKeepUp(config.hash('spotify'), spotifyPlayer)
  })
},updateInterval)

devices.receive('spotify', (message) => {
  spotify.startAndKeepUp((err) => {
    console.log(err)
    if(err)
      return
  })
})


// UI stuff
io.on('connection', (socket) => {
  let interval = setInterval(() => {
    socket.emit('devices', devices.getDeviceList())
  }, updateInterval)
    socket.on('disconnect', () => {
      clearInterval(interval)
      socket.disconnect(true)
    })
})

app.post('/forward', (req,res) => {
  let message = req.body
  devices.forward('ctrl message', message.ip, message, (err) => {
        return res.json({successful: true})
  })
})

app.post('/configure', upload.single('file'), (req, res, next) => {
  const color = new Color()
  config.set("device.color", req.body.color)
  config.set("device.colordark", color.darken(req.body.color))
  config.set("device.ip", req.body.ip)
  config.set("device.name", req.body.name)
  return res.json('Configuration Received')
}) 

/* old player stuff
app.post('/startservice', (req,res) => {
  let started = player.start(req.body.service, (res) => {

  })
  config.set('player', {})
  config.set('player.name', req.body.service.charAt(0).toUpperCase() + req.body.service.slice(1))
  config.set('player.type', 'tx')
  config.set('player.service', req.body.service)
  config.set('player.source', config.getNewPort())
  config.set('player.driver', 'alsa')
  config.set('player.hardware', 'dsnoop:Loopback,1')
  return res.json({ url : `/${started.service}`, successful : started.successful }) 
})
*/

app.post('/seteq', (req,res) => {
  if(req.body.value == 'flat') { 
    eq.flat() 
  } else {
    eq.set(req.body.value.param, req.body.value.value)
  }
  return res.json({successful: true})
})

app.post('/connectservice', (req,res) => {
  return res.json({url : '/', successful : true })
})


app.post('/reload', (req,res) => {
  return console.log('reload')
})

app.post('/reboot', () => {
  console.log('rebooting')
    exec('sudo reboot')
});

app.post('/factoryreset', () => {
  fs.copyFile('public/images/duckado-logo.jpg', 'public/images/logo', (err) => {
    if (err) { console.log('error resetting logo file:', err)}
  })
  fs.unlinkSync('config/config.json')
  setTimeout( () => {
    exec('sudo reboot')
  },250)
})

app.post('/update', (req,res) =>{
  exec('git pull', (err, stdout, stderr) => {
    if (stdout) {
      exec('sudo reboot')
    }
  })
})


// Routes
app.get('/', async (req, res) => {
  res.render('user.ejs', {config: config.configObject, updateInterval: updateInterval});
});
app.get('/settings', (req, res) => {
  res.render('settings.ejs', {config: config.configObject, updateInterval: updateInterval});
});
app.get('/player', (req, res) => {
  res.render('player/player.ejs', {config: config.configObject, updateInterval: updateInterval});
});
app.get('/spotify', (req, res) => {
  res.render('player/services/spotify.ejs', {config: config.configObject});
});
app.get('/cloud', (req, res) => {
  res.render('player/services/duckadocloud.ejs', {config: config.configObject});
});
app.get('/eq', (req, res) => {
  eq.get((message) => {
    console.log(message)
    res.render('processing/eq.ejs', { config: config.configObject, processing: message });
  })
});


//
// Starting the App
//
const server = http.listen(process.env.PORT || port, function() {
  console.log('listening on *:' + port);
});