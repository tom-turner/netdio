const net = require('net'),
JsonSocket = require('json-socket');
const find = require('local-devices');
const EventEmitter = require('events');
const emitter = new EventEmitter();

var oneHr = 1000 * 60 * 60
var port = 20000

function notEqual(obj){
    return (other) => {
        return obj !== other
    }
}


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

            callback(socket.id)

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

            // forwards message to the partner
            emitter.on(socket.id, (message) => {

                socket.sendMessage(message)
            })


            socket.on('end', () => {
                this.devices = this.devices.filter(notEqual(this.devices[socket.id]))
                    //this.devices = this.filterFromList(socket.id)
                emitter.emit('disconnect')
                console.log(socket.id , "left")
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
    }  

    on( event , callback ){
        emitter.on( event , (message) => {
            callback(message)
        })
    }

    forward(device, message, callback ) {
        var program = message.type.split('.')[0]
        var type = message.type.split('.')[1]
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

            socket.setTimeout(oneHr)
            socket.on('timeout', () =>{
                netSocket.end()
            })
            // listens for connection
            socket.on('connect', () => {

                socket.id = netSocket.remoteAddress.replace(/[^.0-9]+/, '')
                socket.sendMessage({
                    handshake : true,
                    config : this.config
                });

                callback(socket.id)

                // listens for message 
                socket.on('message', (message) => {
                    if(message.handshake) {
                        this.devices[socket.id] = message.config

                        emitter.emit('connection', message )
                    } else {
                        emitter.emit('ctrlMessage', message)
                    }
                })
                
                // forwards message to partner
                emitter.on(device.ip, (message) => {

                    socket.sendMessage(message)
                })


                socket.on('end', () => {

                    this.devices = this.devices.filter(notEqual(this.devices[socket.id]))
                    //this.devices = this.filterFromList(socket.id)
                    emitter.emit('disconnect')
                    console.log(socket.id , "left")
                })  

            });

            socket.on('error', err => reject(err) );

            }).then( connection => { // handles errors
                connection.on('data', data => {})
            }, error => {})        
        }
    }

    module.exports = Devices

