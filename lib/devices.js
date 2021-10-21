const net = require('net'),
    JsonSocket = require('json-socket');
let bonjour = require('bonjour')()
let type = 'duckado-config'

class Devices {
    constructor(config) {
        this.config = config
        this.options = {
            name: this.config.device.id, 
            type: type,
            host: '224.0.1.1',
            port: 20000, 
            txt: ({ message: JSON.stringify( this.config ) }) 
        }
        this.service = bonjour.publish(this.options)
        this.find = bonjour.find({ type: type })
    }

    getList(key) {
        key ? type = key : type = type
        let services = this.find.services.filter( (event) => {
            return event.type == type
        })
        let devices = []
        for ( var service of services ) {
            console.log(service.referer.address)
            devices.push(JSON.parse(service.rawTxt.toString().slice(9)))
        }
        return devices
    }

   	forward(device, message, callback ) {
        let netSocket = new net.Socket()
        let socket = new JsonSocket(netSocket)
        socket.connect(this.options.port, device.ip);
        socket.on('connect', () => {
            callback()
            socket.sendMessage(message)
        })
    }

    receive(type, callback) {
        var server = new net.createServer();
        server.listen(this.options.port);
        server.on('connection', (netSocket) => {
            var socket = new JsonSocket(netSocket);
            socket.on('message', (message) => {
                message.error ? console.log(message) : '' ;
                callback(message)
            })
        })

    }
}

module.exports = Devices
