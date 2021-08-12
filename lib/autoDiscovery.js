const net = require('net'),
JsonSocket = require('json-socket');
const find = require('local-devices');
const EventEmitter = require('events');
const emitter = new EventEmitter();

var port = 20000

class Devices {

    constructor(config) {
        this.config = config
        this.devices = []
        this.server = null
    }

    listen(callback) {
        var server = new net.createServer();
        server.listen(port);
        server.on('connection', (netSocket) => {
            var socket = new JsonSocket(netSocket);
            socket.id = netSocket.remoteAddress.replace(/[^.0-9]+/, '')
            
            socket.on('message', (message) => {
                message.error ? console.log(message) : '' ;

                switch (message.type) {
                    case 'handshake' :
                        this.devices[socket.id] = message.config
                        emitter.emit('connection', socket.id)
                        socket.sendMessage({
                            type : 'handshake',
                            config : this.config
                        });
                    break
                    case 'ctrl message' :
                        emitter.emit('ctrlMessage', message.data)
                    break
                    default: 
                        console.log(message)
                }
            })
            
            // forwards message to the partner
            emitter.on(socket.id, (message) => {
                socket.sendMessage({
                    type: 'ctrl message',
                    data: message
                })
            })

            socket.on('end', () => {
                emitter.emit('disconnect', socket.id)
                delete this.devices[socket.id]
            })
        })
    }

    find(callback){
        find().then(devices => {
            for ( var device of devices ) {
                this.startConnection( (data) => {
                    callback(data)

                }, device )
            }
        })
        // start comms with self (needed on RPI)
        this.startConnection((self) =>{
        }, this.config.device )
    }  

    on( event , callback ){
        emitter.on( event , (message) => {
            callback(message)
        })
    }

    forward(device, message, callback ) {
        var program = message.type.split('.')[0]
        var type = message.type.split('.')[1]
        console.log('emmited message',device, message)
        emitter.emit(device, message, (res) => {

            callback(res)
        })
        this.devices[device][program][type] = message.value 
    }

    getDevices() {
        return Object.values(this.devices)
    }

    startConnection(callback, device, message){
        new Promise((resolve, reject) => {
            // starts connection and message bus
            let netSocket = new net.Socket()
            let socket = new JsonSocket(netSocket)
            socket.connect(port, device.ip);
            socket.on('connect', () => {
                socket.id = netSocket.remoteAddress.replace(/[^.0-9]+/, '')
                
                socket.sendMessage({
                    type : 'handshake',
                    config : this.config
                });

                socket.on('message', (message) => {
                    message.error ? console.log(message) : '' ;
                    
                    switch (message.type) {
                        case 'handshake' :
                            this.devices[socket.id] = message.config
                            emitter.emit('connection', socket.id)
                        break
                        case 'ctrl message' :
                            emitter.emit('ctrlMessage', message.data)
                        break
                        default: 
                            console.log(message)
                    }
                })
                
                // forwards message to partner
                emitter.on(device.ip, (message) => {
                    socket.sendMessage({
                        type: 'ctrl message',
                        data: message
                    })
                })

                socket.on('end', () => {
                    emitter.emit('disconnect', socket.id)
                    delete this.devices[socket.id]
                })  

            });

            socket.on('error', err => reject(err) );

            }).then( connection => { // handles errors
                connection.on('data', data => {})
            }, error => {})        
        }
    }

    module.exports = Devices

