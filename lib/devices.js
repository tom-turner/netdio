const net = require('net'),
    JsonSocket = require('json-socket');
const EventEmitter = require('events');
const emitter = new EventEmitter();
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
            this.pingAllServices(this.find.services)
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

    getDeviceList() {
        return Object.values(this.devices).filter((event) => {
            return event.up !== false
        })
    }

    getDeviceIp(name, type){
        type ? type = type : type = this.find
        let device = type.services.filter( (event) =>{
            return event.name == name
        })
        return device[0].referer.address
    }

    getDevice(name){
        return this.devices[this.alphabetify(name)]
    }

    pingAllServices(devices){
        for (var device of devices) {
            this.forward('discovery', device.name, 'keep alive', (res) => {
                if (res.success) {
                    this.addDeviceAndKeepUp(res.device.device.id, res.device)
                }
                return
            })
        }
    }  

    addDeviceAndKeepUp(key, device){
        let hashKey = this.alphabetify(key)
        
        if(this.devices[hashKey]){
            this.keepAlive(hashKey)
            return
        }

        this.timeout((dead)=>{
            dead ? this.removeDevice(key) : ''
        }, hashKey) 

        device.up = true 
        this.devices[hashKey] = device
    }

    removeDevice(key){
        key = this.alphabetify(key)
        this.devices[key].up = false
        delete this.devices[key]
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
                socket.sendEndMessage({success: true, device: this.getConfig()})
            })
        })
    }

    alphabetify(input){
        let letters = ['A','B','C','D','E','F','G','H','I','J']
        let result = '';    
        for (let i of input.toString()) {
            result += letters[i]
        }
        return result
    }

    timeout(callback, id) {
        let timer = this.updateInterval * 2.5
        emitter.on(id, () => {
            timer = this.updateInterval * 2.5
        })

        var timeout = setInterval( () => {
            timer = timer - this.updateInterval
            if(timer <= 0) {
                callback(true)
                clearInterval(timeout)
            } else {
                callback(false);
            }
        },this.updateInterval)
    }

    keepAlive(id){
        emitter.emit(id)
    }


}

module.exports = Devices
