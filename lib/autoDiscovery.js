const net = require('net'),
JsonSocket = require('json-socket');
const find = require('local-devices');
const EventEmitter = require('events');
const emitter = new EventEmitter();

var port = 20000

function generateNewId() {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  var charactersLength = characters.length;
  for ( var i = 0; i < 8; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * 
     charactersLength));
}
return result;
}


class Devices {

    constructor(config) {
        this.config = config
        this.devices = {}
        this.server = null
    }

    startConnection(callback, device, message){
        new Promise((resolve, reject) => {

            // starts connection and message bus
            let netSocket = new net.Socket()
            let socket = new JsonSocket(netSocket)
            if (device.ip !== this.config.ip) {
                socket.connect(port, device.ip);
            }

        

            // listens for connection
            socket.on('connect', () => {
                socket.id = netSocket.remoteAddress.replace(/[^.0-9]+/, '')
                socket.sendMessage({
                    handshake : true,
                    config : this.config
                });


                // listens for message 
                socket.on('message', (message) => {
                    if(message.handshake) {
                        this.devices[socket.id] = message.config
                        emitter.emit('connection', message )
                    } else {
                        emitter.emit('ctrlMessage', message)
                    }
                })
                
                // sends message to client
                emitter.on(device.ip, (message) => {
                    console.log("sent message", message)
                    socket.sendMessage(message)
                    this.devices[socket.id][message.type] = message[message.type]
                })


                socket.on('end', () => {
                    this.devices = Object.values(this.devices).filter((ele) => {
                        return ele != this.devices[socket.id]
                    });
                    emitter.emit('disconnect')
                })  

            });

            socket.on('error', err => reject(err) );

            }).then( connection => { // handles errors
                connection.on('data', data => {})
            }, error => {})        
        }

        startListening(callback) {
            var server = new net.createServer();
            server.listen(port);
            server.on('connection', (netSocket) => {
                var socket = new JsonSocket(netSocket);
                socket.id = netSocket.remoteAddress.replace(/[^.0-9]+/, '')

                console.log(socket.id)

                socket.on('message', (message) => {

                    if(message.handshake) {
                        this.devices[socket.id] = message.config
                        emitter.emit('connection', message )
                        socket.sendMessage({
                            handshake : true ,
                            config : this.config
                        }) 
                    } else {
                        emitter.emit('ctrlMessage', message)
                    }
                })

                emitter.on(socket.id, (message) => {
                    console.log("sent message",message)
                    socket.sendMessage(message)
                    this.devices[socket.id][message.type] = message[message.type]
                })


                socket.on('end', () => {
                    this.devices = Object.values(this.devices).filter((ele) => {
                        return ele != this.devices[socket.id]
                    });
                    emitter.emit('disconnect')
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

        getDevices() {
            return Object.values(this.devices)
        }
}

    module.exports = Devices

