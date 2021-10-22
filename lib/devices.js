const net = require('net'),
    JsonSocket = require('json-socket');
const EventEmitter = require('events');
const emitter = new EventEmitter();
emitter.setMaxListeners(1000)
let bonjour = require('bonjour')({
    multicast: true,
    loopback: true
})
let type = 'duckado-config'
const timeoutInMs = 5000
const interval = 1000

function debounce(fn, timeout) {
  let interval = null

  return function (...args) {
    if (interval)
      clearInterval(interval)

    interval = setTimeout(function () {
      fn.apply(null, args)
    }, timeout)
  }
}

class Devices {
    constructor(config) {
        this.config = config
        this.localConfig = ''
        this.devices = []
        this.service = bonjour.publish(this.options())
        this.find = bonjour.find({ type: type })
        this.keepAlive = setInterval(()=>{
            this.announce(this.find.services)
            emitter.emit('change')
        },interval)
    }

    options(){
        return {
            name: this.getConfig().device.id, 
            type: type,
            host: '224.0.1.1',
            port: this.getPort(), 
            probe: false 
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

    getDeviceIp(name){
        let device = this.find.services.filter( (event) =>{
            return event.name == name
        })
        return device[0].referer.address
    }

    onChange(callback){
        emitter.on('change', () => {
            callback(this.getDeviceList())
        })
        emitter.emit('change')
    }

    announce(devices){
        for (var device of devices) {
            this.forward('discovery', device.name, this.getConfig(), (res) => {
                if (res.success) {
                    this.addDevice(res.device)
                }
            })
        }
    }  

    startKeepAlive(){
        this.keepAlive
    }

    stopKeepAlive(){
        clearInterval(this.keepAlive)
    }

    addDevice(device){
        let id = device.device.id
        this.timeout((dead)=>{
            if(dead){
                device.up = false
                this.devices[id] = device
            }
        },id)
        device.up = true 
        this.devices[id] = device
        emitter.emit(id)
    }

    // NOTE! for some reason timeout gets called multiple times for each device added. 
    // need to look into it as its currently using a suprising amount of CPU.
    timeout(callback, ref) {
        let timer = timeoutInMs
        emitter.on(ref, () => {
          timer = timeoutInMs
        })
        var timeout = setInterval( () => {
            timer = timer - interval
            if(timer <= 0) {
                callback(true)
                clearInterval(timeout)
            } else {
                callback(false);
            }
        },interval)
    }

    forward(type, device, message, callback ) {
        try{ device = this.getDeviceIp(device) } catch { return }
        let netSocket = new net.Socket()
        let socket = new JsonSocket(netSocket)
        socket.connect(this.getPort(type), device)
        socket.on('error', (err) => {
            
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
                console.log('receive', err)
            }) 
            socket.on('message', (message) => {
                message.error ? console.log(message) : '' ;
                callback(message)
                socket.sendMessage({success: true, device: this.getConfig()})
            })
        })
    }
}

module.exports = Devices
