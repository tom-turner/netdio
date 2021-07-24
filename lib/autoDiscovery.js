const net = require('net')
const JsonSocket = require('json-socket');
const find = require('local-devices');
var socket = new JsonSocket(new net.Socket());
var port = 20000



class Devices {

	constructor(config) {
		this.config = config
	}

	listenForNewDevices(callback) {
		var connection = net.createServer();
		connection.listen(port)
		connection.on('connection', (socket) => {
			socket = new JsonSocket(socket) 
			socket.on('message', (message) => {
				socket.sendEndMessage(this.config);
				if (message.ip != this.config.ip) {
					callback(message)
				}	
			})
		})	


		find().then(devices => {
			for ( var device of devices ) {
				JsonSocket.sendSingleMessageAndReceive(port, device.ip, this.config, function(err, message) {
					if (err) {}
					try {
						if (message.ip != this.config.ip) {
							callback(message) 
						}
					} catch {}
				})	
			}
		})
	}

	
}

module.exports = Devices

