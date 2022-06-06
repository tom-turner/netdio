require('dotenv').config()
const port = process.env.REACT_APP_SERVER_PORT || 5050;
const express = require('express');
const app = express();
const http = require('http').Server(app);
const bodyParser = require('body-parser')
const cors = require('cors');
const cookieParser = require('cookie-parser');
const routes = require("./routes");

const config = require('./lib/config')
const audio = require("./lib/NetworkAudio");
const { Tx, Rx, Spotify } = require('./lib/networkServices')
const { audioStream } = require('./lib/api')


app.use(cors({
  origin: (origin, next) => next(null, origin)
}))

app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.urlencoded());
app.use(routes)

if(config.configObject.tx)
  Tx.publish()

// refactor to encapsulate subscribing to the audio stream into the audio.receive() function
if(config.configObject.rx) {
  Rx.publish()
//  audio.receive(config.configObject.source.socket)

  //then subscribe to the audio stream
  setInterval( async ()=>{
  //  audioStream(config.configObject.source)
  },1000)
}


//process.on('uncaughtException', function (err) {
//    console.log(err);
//}); 

const server = http.listen(port, function() {
  console.log('listening on *:' + port);
});