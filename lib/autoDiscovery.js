
const net = require('net'),
JsonSocket = require('json-socket');
const find = require('local-devices');
const EventEmitter = require('events');
const emitter = new EventEmitter();

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
                        emitter.emit('connection', message )
                        callback(message)
                    } else {
                        emitter.emit('message', message)
                    }

                })
                
                emitter.on(device.ip, (message) => {
                    client.sendMessage(message)
                })

                client.on('end', () => {
                    emitter.emit('disconnect', partner )
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
                    emitter.emit('connection', message )
                    callback(message)
                    socket.sendMessage({
                        handshake : true ,
                        config : this.config
                    }) 
                } else {
                    emitter.emit('message', message)
                }
            })

            emitter.on(partner.ip, (message) => {
                socket.sendMessage(message)
            })


            socket.on('end', () => {
                emitter.emit('disconnect', partner )
                callback({
                    disconnect : true,
                    config : partner
                })
                // log client disconnection
            })

        })
    }

    on( event , callback){
        emitter.on( event , (message) => {
            callback(message)
        })
    }

    emit( device, message, callback ) {
        emitter.emit( device, message , (res) => {
            callback(res)
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

    pingDevices(callback) {
        getDeviceIps( (device) => {
            this.sendMessage( (data) => {
                callback(data)
            }, device )
        })
    }

}

module.exports = Devices

