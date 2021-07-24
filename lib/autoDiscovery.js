const net = require('net')
const JsonSocket = require('json-socket');
const find = require('local-devices');
const Configuration = require('./configuration')

var config = new Configuration('./config/rx-config.json')
var socket = new JsonSocket(new net.Socket());
var port = 52342


function getUnitConfig() {
	return {
		name : config.get('name'),
		type : config.get('type'),
		ip : config.get('ip')
	}
}

class Devices {



	device() {


		}



	findDevicesAndListenForNewDevices(callback) {
		var connection = net.createServer();
		connection.listen(port)
		connection.on('connection', function(socket){
			socket = new JsonSocket(socket) 
			socket.on('message', function(message) {

				callback(message)

				socket.sendEndMessage(getUnitConfig());

			})
		})

		find().then(devices => {
			for ( var device of devices ) {
				JsonSocket.sendSingleMessageAndReceive(port, device.ip, getUnitConfig(), function(err, message) {
					if (err) {}
					try {
						if (message.ip) {
							callback(message) 
						}
					} catch {}
				})	
			}
		})		
	}


  get(key) {
  	console.log(key)
    return this.device()[key]
  }

}

module.exports = Devices

