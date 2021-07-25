
const net = require('net'),
JsonSocket = require('json-socket');
const find = require('local-devices');

var port = 20000


function getDeviceIps(callback) {
	find().then(devices => {

		for ( var device of devices ) {
          
			callback(device)

		}
	})
}



class Devices {
	constructor(config) {
		this.config = config
	}

	pingDevices(callback) {

		getDeviceIps( (device) => {
			new Promise((resolve, reject) => {

             let client = new JsonSocket(new net.Socket())

             client.connect(port, device.ip);
             client.on('connect', () => {

                let partner = '';

                client.sendMessage({
                    handshake : true,
                    config : this.config
                });
                client.on('message', (message) => {
                    if(message.handshake) {
                        partner = message.config
                        callback(message)
                    }

                })
                client.on('end', () => {
                    callback({
                        disconnection : true,
                        config : partner
                    })

                })
            });
             
             client.on('error', err => reject(err) );


    		}).then( connection => { // handles errors
                connection.on('data', data => {
        				// Do stuff with the data
        			})
            }, error => {})
      })
	}

    startListening(callback) {
        var server = new net.createServer();
        server.listen(port);
        server.on('connection', (socket) => {

            let partner = '';

            socket = new JsonSocket(socket);

            socket.on('message', (message) => {
                if(message.handshake) {
                    partner = message.config
                    callback(message)
                    socket.sendMessage({
                        handshake : true ,
                        config : this.config
                    })
                }
            })
            socket.on('end', () => {
                callback({
                    disconnection : true,
                    config : partner
                })
                // log client disconnection
            })

        })
    }






    
}

module.exports = Devices

