
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
            this.sendMessage( (data) => {
                callback(data)
            }, device )
        })
    }

    sendMessage(callback, device, message){
        new Promise((resolve, reject) => {

            let client = new JsonSocket(new net.Socket())

            if (device.ip !== this.config.ip) {
                client.connect(port, device.ip);
            }

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
                        disconnect : true,
                        config : partner
                    })

                })
            });

            client.on('error', err => reject(err) );


            }).then( connection => { // handles errors
                connection.on('data', data => {})
            }, error => {})        

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
                    disconnect : true,
                    config : partner
                })
                // log client disconnection
            })

        })
    }

    connect(callback){

        this.startListening( (device) => {
          callback(device)
      })

        this.pingDevices( (device) => {
          callback(device)
      })

    }    
}

module.exports = Devices

