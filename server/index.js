require('./lib/setup').setup() // setup device first
require('dotenv').config()
const port = process.env.REACT_APP_SERVER_PORT || 5050;
const express = require('express');
const app = express();
const http = require('http').Server(app);
const cors = require('cors');
const authorization = require('./middleware/authorization')
const bodyParser = require('body-parser')
const routes = require("./routes");

app.use(cors({
  origin: (origin, next) => next(null, origin),
}))
app.use(authorization)
app.use(bodyParser.json());
app.use(express.urlencoded());
app.use(routes)

require('./lib/setup').run()

const server = http.listen(port, function() {
  console.log('listening on *:' + port);
});