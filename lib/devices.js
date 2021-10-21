const net = require('net'),
    JsonSocket = require('json-socket');
let bonjour = require('bonjour')({
    multicast: true,
    loopback: true
})
let type = 'duckado-config'

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
        this.ctrlPort = 20000
        this.configPort = 20001
        this.service = bonjour.publish(this.options())
        this.find = bonjour.find({ type: type })
        this.debouncedUpdate = debounce(() => this.update(), 350)
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
        this.find.update()
        key ? type = key : type = type
        let services = this.find.services.filter( (event) => {
            return event.type == type
        })
        let devices = []
        for ( var service of services ) {
            devices.push(JSON.parse(service.rawTxt.toString().slice(9)))
        }
        return devices
    }

    getDeviceIp(name){
        this.find.update()
        let device = this.find.services.filter( (event) =>{
            return event.name == name
        })
        return device[0].referer.address
    }

    onChange(callback){
        callback(this.getList())
        this.find.on('up',() => {
            callback(this.getList())
        })
        this.find.on('down',() => {
            callback(this.getList())
        })

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

   	forward(device, message, callback ) {
        try{ device = this.getDeviceIp(device) } catch { return }
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
