const net = require('net')
const JsonSocket = require('json-socket')
const find = require('local-devices')

var port = 20000

async function connectToDevice(device) {
  let client = new JsonSocket(new net.Socket())
  client.connection(port, device.ip)

  return new Promise((resolve, _reject) => {
    client.on('connect', () => resolve(client))
  })
}

class Devices {
  constructor(config) {
    this.config = config
  }

  async pingDevices(callback) {
    let devices = await find()

    for (let device of devices) {
      let connection = connectToDevice(device)
      connection.on('message', packet => {
        if (packet.handshake)
          device.config = packet.config

        callback({ disconnect: false, packet: packet })
      })
      connection.on('end', () => {
        callback({ disconnect: true, device: device })
      })
      connection.send({ handshake: true, config: this.config })
    }
  }

  startListening(callback) {
    this.server = new net.createServer();
    this.server.listen(port);
    this.server.on('connection', (socket) => {
      let partnerConfig = null
      connection = new JsonSocket(socket)

      connection.on('message', packet => {
        if (packet.handshake) {
          partnerConfig = message.config
          socket.sendMessage({ handshake: true, config: this.config })
        }

        callback({ disconnect: false, packet: message })
      })

      connection.on('end', () => {
        callback({ disconnection: true, config: partnerConfig })
      })
    })
  }
}

module.exports = Devices
