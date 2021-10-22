const net = require('net'),
    JsonSocket = require('json-socket');
const EventEmitter = require('events');
const emitter = new EventEmitter();
emitter.setMaxListeners(2)
let bonjour = require('bonjour')({
    multicast: true,
    loopback: true
})
let type = 'duckado-config'
const timeoutInMs = 2000
const interval = 100

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

function getPort(type){
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

class Devices {
    constructor(config) {
        this.config = config
        this.devices = []
        this.service = bonjour.publish(this.options())
        this.find = bonjour.find({ type: type })
        this.find.on('up', (device) => {
            this.announce(device)
        })
        
        this.debouncedUpdate = debounce(() => this.update(), 350)
    }

    options(){
        return {
            name: this.config.configObject.device.id, 
            type: type,
            host: '224.0.1.1',
            port: getPort(), 
            probe: false 
        }
    }

    getDeviceList(key) {
        return (this.devices.filter((event) => {
            return event.up != false
        }))
    }

    saveDeviceToList(device){
        console.log(device)
    }
    removeDeviceFromList(device){
        delete this.devices[device.name]
    }

    getDeviceIp(name){
        this.find.update()
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

    announce(device){
        this.forward('discovery', device.name, this.config.configObject, (res) => {
           if (res.success) {
            setTimeout(()=>{
                this.announce(device)
            },1000)
           }
        })
    }
    publish(){
        if(this.devices){
            setInterval(()=>{
                for (var device of this.devices){
                    console.log(this.devices)
                    device.name = device.device.id
                    this.announce(device)
                }
            },1000)
        }
    }

    addDevice(device){
        let id = JSON.stringify(device.device.id)
        this.timeout((dead)=>{
            if(dead){
                device.up = false
                this.devices[id] = device
                emitter.emit('change')
            }
        },id)
        device.up = true 
        this.devices[id] = device
        emitter.emit(id)
        emitter.emit('change')
    }

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
        socket.connect(getPort(type), device)
        socket.on('error', (err) => {
            console.log(err)
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
        server.listen(getPort(type));
        server.on('connection', (netSocket) => {
            var socket = new JsonSocket(netSocket);
            socket.on('error', (err) => {
                console.log('receive', err)
            }) 
            socket.on('message', (message) => {
                message.error ? console.log(message) : '' ;
                callback(message)
                socket.sendMessage({success: true})
            })
        })
    }
}

module.exports = Devices
