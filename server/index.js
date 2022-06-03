require('dotenv').config()
const port = process.env.PORT || 5000;
const express = require('express');
const app = express();
const http = require('http').Server(app);
const bodyParser = require('body-parser')
const cors = require('cors');
const cookieParser = require('cookie-parser');
const routes = require("./routes");
const config = require('./lib/config')();
const { Tx, Rx, Spotify } = require('./lib/networkServices')

app.use(cors({
  origin: (origin, next) => next(null, origin),
  credentials: true
}))
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.urlencoded());
app.use(routes)

if(config.configObject.tx)
  Tx.publish()

if(config.configObject.rx) 
  Rx.publish()

//process.on('uncaughtException', function (err) {
//    console.log(err);
//}); 

const server = http.listen(port, function() {
  console.log('listening on *:' + port);
});