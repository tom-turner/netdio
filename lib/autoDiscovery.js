const net = require('net'),
JsonSocket = require('json-socket');
const find = require('local-devices');
const EventEmitter = require('events');
const emitter = new EventEmitter();

var port = 20000

class Devices {

	constructor(config) {
		this.config = config
	}

    startConnection(callback, device, message){
        new Promise((resolve, reject) => {

            // starts connection and message buss
            let client = new JsonSocket(new net.Socket())
            if (device.ip !== this.config.ip) {
                client.connect(port, device.ip);
            }

            // listens for connection
            client.on('connect', () => {
                let partner = '';

                client.sendMessage({
                    handshake : true,
                    config : this.config
                });

                // listens for message 
                client.on('message', (message) => {
                    if(message.handshake) {
                        partner = message.config
                        emitter.emit('connection', message )
                    } else {
                        emitter.emit('message', message)
                    }

                })
                
                // sends message to client
                emitter.on(device.ip, (message) => {
                    client.sendMessage(message)
                    console.log("sent message",message)
                })


                client.on('end', () => {
                    emitter.emit('disconnect', partner )
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
                        socket.sendMessage({
                            handshake : true ,
                            config : this.config
                        }) 
                    } else {
                        emitter.emit('message', message)
                    }
                })

                emitter.on(device.ip, (message) => {

                    socket.sendMessage(message)
                    console.log("sent message",message)
                })


                socket.on('end', () => {
                    emitter.emit('disconnect', partner )
                // log client disconnection
                })

            })
        }

        on( event , callback ){
            emitter.on( event , (message) => {
                callback(message)
            })
        }

        forward(device, message, callback ) {
            emitter.emit(device, message, (res) => {
                callback(res)
            })
        }

        connect(callback){
            this.startListening( (device) => {
              callback(device)
          })
            find().then(devices => {
                for ( var device of devices ) {
                    this.startConnection( (data) => {
                        callback(data)
                    }, device )
                }
            })
        }   





    }

    module.exports = Devices

