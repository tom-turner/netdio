const net = require('net'),
    JsonSocket = require('json-socket');
const EventEmitter = require('events');
let bonjour = require('bonjour')()
let type = 'duckado-config'
let host = '224.0.1.1'
let port = 20000
let find = bonjour.find({ type: type })

class Devices {
    publish(config){
        //console.log('publishing')
        bonjour.unpublishAll()
        let options = {
            name: config.device.id, 
            type: type,
            host: host,
            port: port, 
            txt: ({ message: JSON.stringify(config) }) 
        }
        bonjour.publish(options)
    }

    getList(key) {
        key ? type = key : type = type
        let services = find.services.filter( (event) => {
            return event.type == type
        })
        let devices = []
        for ( var service of services ) {
            devices.push(JSON.parse(service.rawTxt.toString().slice(9)))
        }
        return devices
    }

   	forward(device, message, callback ) {
        let netSocket = new net.Socket()
        let socket = new JsonSocket(netSocket)
        socket.connect(port, device.ip);
        socket.on('connect', () => {
            callback()
            socket.sendMessage(message)
        })
    }

    receive(type, callback) {
        var server = new net.createServer();
        server.listen(port);
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
