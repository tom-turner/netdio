require('dotenv').config()
const port = process.env.PORT || 5000;
const express = require('express');
const app = express();
const http = require('http').Server(app);
const bp = require('body-parser');
const cors = require('cors');
const routes = require("./routes");
const config = require('./lib/config')('./config/config.json');
const setup = require('./lib/setup');
//const { Network, Tx, Rx, Spotify } = require('./lib/networkServices')


app.use(cors({
  origin: (origin, next) => next(null, origin),
}))



//Network.publish()
//Network.subscribe( async device => {} )

app.use(routes)

const server = http.listen(port, function() {
  console.log('listening on *:' + port);
});