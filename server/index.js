require('dotenv').config()
const port = process.env.PORT || 5000;
const express = require('express');
const app = express();
const http = require('http').Server(app);
const routes = require("./routes")
const bp = require('body-parser');
const setup = require('./lib/setup')
const { Network, Tx, Rx, Spotify } = require('./lib/networkServices')

Network.publish()
Network.subscribe( async device => console.log(device) )

app.use(routes)

const server = http.listen(port, function() {
  console.log('listening on *:' + port);
});