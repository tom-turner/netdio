let express = require('express');
let routes = express.Router();
const config = require('./lib/config')();
const { Network, Tx, Rx, Spotify } = require('./lib/networkServices')

routes.get('/get-network-device-list', async (req, res) => {
  res.send( Network.getDeviceList() )
});

routes.get('/get-config', async (req, res) => {
  res.send(config.configObject);
});


module.exports = routes