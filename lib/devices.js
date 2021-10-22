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
        setInterval(()=>{
            this.keepAlive(this.find.services)
        },500)  

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

    keepAlive(services){
        for (let device of services ) {
            this.forward('discovery', device.name, this.config.configObject, (res) => {
                if (res.success) {
                }
            })
        }
    }

    addDevice(device){
        device.up = true 
        this.devices[device.device.id] = device
        emitter.emit(device.device.id)

        this.timeout((dead)=>{
            if(dead){
                device.up = false
                this.devices[device.device.id] = device
                emitter.emit('change')
            }
        }, device.device.id)
    }

    timeout(callback, keepAlive) {
        let timer = timeoutInMs

        emitter.on(keepAlive, () => {
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


    updateService(){
        this.debouncedUpdate()
    }

    update(){
        if (JSON.stringify(this.service.txt) != JSON.stringify(this.options().txt)){
            this.service.stop((err)=>{
                this.service.txt = this.options().txt 
                this.service.start(this.options())
            })
        }
    }

    forward(type, device, message, callback ) {
        try{ device = this.getDeviceIp(device) } catch { return }
        let netSocket = new net.Socket()
        let socket = new JsonSocket(netSocket)
        socket.connect(getPort(type), device)
        socket.on('error', (err) => {
            console.log('forward', err)
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
