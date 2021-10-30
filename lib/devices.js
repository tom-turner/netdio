const net = require('net'),
    JsonSocket = require('json-socket');
let bonjour = require('bonjour')({
    multicast: true,
    loopback: true
})
let defaultType = 'duckado-config'

class Devices {
    constructor(config, updateInterval) {
        this.config = config
        this.updateInterval = updateInterval
        this.localConfig = ''
        this.devices = []
        this.service = this.publish(defaultType)
        this.find = this.discover(defaultType)
        setInterval(()=>{
            this.announce(this.find.services)
        },this.updateInterval)
    }

    publish(type, txt){
        return bonjour.publish(this.options(type, txt))
    }
    
    discover(type){
        return bonjour.find({ type: type })
    }

    options(type, txt){
        return {
            name: this.getConfig().device.id, 
            type: type,
            host: '224.0.1.1',
            port: this.getPort(),
            txt: txt
        }
    }

    getPort(type){
        switch (type) {
            case 'ctrl message' :
            return 20001
            break
            case 'roc' :
            return 20002 
            break
            case 'discovery' :
            return 20003
            break
            default :
            return 20000
        }
    }

    getConfig(){
        let storedConfig = this.config.configObject
        if ( this.localConfig = storedConfig ) {
            return this.localConfig
        } else {
            this.localConfig == storedConfig
            return this.localConfig
        }
    }

    getDeviceList(key) {
        return (this.devices.filter((event) => {
            return event.up != false
        }))
    }

    getDeviceIp(name, type){
        type ? type = type : type = this.find
        let device = type.services.filter( (event) =>{
            return event.name == name
        })
        return device[0].referer.address
    }

    getDevice(name){
        return this.devices[name]
    }

    announce(devices){
        for (var device of devices) {
            this.forward('discovery', device.name, this.getConfig(), (res) => {
                if (res.success) {
                    return this.addDevice(res.device)
                }
                if (res.error) {
                    try {
                        this.devices[device.name]['up'] = false
                    } catch { console.log('caught error in announce:', res.error) }
                    return
                }
            })
        }
    }  

    addDevice(device){
        let id = device.device.id
        device.up = true 
        this.devices[id] = device
    }

    removeDevice(device){
        let id = device.device.id
        device.up = false 
        delete this.devices[id]
    }

    forward(type, device, message, callback ) {
        try{ device = this.getDeviceIp(device) } catch { return }
        let netSocket = new net.Socket()
        let socket = new JsonSocket(netSocket)
        socket.connect(this.getPort(type), device)
        socket.on('error', (err) => {
            callback({error : err})
        }) 
        socket.on('connect', () => {
            socket.sendMessage(message)
            socket.on('message', (message) => {
                if(message.success){
                    callback(message)
                }
            })
        })
    }

    receive(type, callback) {
        var server = new net.createServer();
        server.listen(this.getPort(type));
        server.on('connection', (netSocket) => {
            var socket = new JsonSocket(netSocket);
            socket.on('error', (err) => {
                callback({error : err})
            }) 
            socket.on('message', (message) => {
                message.error ? console.log('error with ' + type + ' message receive', message) : '' ;
                callback(message)
                socket.sendMessage({success: true, device: this.getConfig()})
            })
        })
    }

}

module.exports = Devices
