const net = require('net'),
    JsonSocket = require('json-socket');
let bonjour = require('bonjour')()
let type = 'duckado-config'

class Devices {
    constructor(config) {
        this.config = config
        this.ctrlPort = 20000
        this.configPort = 20001
        this.service = bonjour.publish(this.options())
        this.find = bonjour.find({ type: type })
    }

    options(){
        return {
            name: this.config.configObject.device.id, 
            type: type,
            host: '224.0.1.1',
            port: this.ctrlPort, 
            txt: ({ message: JSON.stringify( this.config.configObject ) }),
            probe: false 
        }
    }

    getList(key) {
        key ? type = key : type = type
        let services = this.find.services.filter( (event) => {
            return event.type == type
        })
        let devices = []
        for ( var service of services ) {
            //console.log(service.referer.address)
            devices.push(JSON.parse(service.rawTxt.toString().slice(9)))
        }
        return devices
    }

    update(callback){
        this.service.stop((err)=>{
            this.service.txt = this.options().txt 
            this.service.start(this.options())
            setTimeout(()=>{
                callback(this.getList())
            })        
        })
    }

   	forward(device, message, callback ) {
        if(device == 'undefined'){
            return
        }
        let netSocket = new net.Socket()
        let socket = new JsonSocket(netSocket)
        socket.connect(this.ctrlPort, device);
        socket.on('connect', () => {
            callback()
            socket.sendMessage(message)
        })
    }

    receive(type, callback) {
        var server = new net.createServer();
        server.listen(this.ctrlPort);
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
