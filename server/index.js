require('dotenv').config()
const port = process.env.PORT || 5000;
const express = require('express');
const app = express();
const http = require('http').Server(app);
const bp = require('body-parser');
const cors = require('cors');
const routes = require("./routes");
const config = require('./lib/config')();
const { Tx, Rx, Spotify } = require('./lib/networkServices')

app.use(cors());

//process.on('uncaughtException', function (err) {
//    console.log(err);
//}); 

Tx.publish()
Tx.subscribe( async device => {} )

//Rx.publish()
//Rx.subscribe( async device => {} )


app.use(routes)

const server = http.listen(port, function() {
  console.log('listening on *:' + port);
});