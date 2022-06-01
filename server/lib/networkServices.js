const fetch = require('node-fetch');
let SHA256 = require("crypto-js/sha256");
let bonjour = require('bonjour')({
    multicast: true,
    loopback: true
})

class NetworkService {
    constructor(type) {
        this.port = process.env.PORT 
        this.config = require('./config')();
        this.type = type
        this.updateInterval = 1000
        this.foundServices = []
        this.devices = []

        // currently need to fetch devices for their configs to ensure they are up.
        // A better solution would be to use Bonjour to know when a device is down or has changed, if that functionality existed.
        setInterval(() => {
            for (var device of Object.values(this.foundServices)) {
                console.log(this.devices)
                this.getDeviceConfig(device)
            }
        }, this.updateInterval)

    }

    publish(config){
        return bonjour.publish({
            name: this.config.configObject.device.id,
            type: this.type,
            host: '224.0.1.1',
            port: 20000,
            txt: JSON.stringify( config || '' ) // currently not using config on bojour as its not updateable.
        })
    }
    
    find(){
        let services = bonjour.find({ type: this.type })
        services.on('up', (service) => {
            this.addDevice(this.parseBonjour(service))
        })
        return services
    }

    parseBonjour(service){
        return {
            ip: service.referer.address,
            id: service.name,
            config: JSON.parse(Object.values(service.txt).join(''))
        } 
    }

    addDevice(device){
        this.foundServices[this.hash(device.id)] = device
    }

    removeDevice(device){
        delete this.foundServices[this.hash(device.id)]
        delete this.devices[this.hash(device.id)]
    }

    async fetch(ip, path){
        let result = await fetch(`http://${ip}:${this.port}/${path}`)
        return await result.json()
    }

    async getDeviceConfig(device){
            let response = await this.fetch( device.ip, 'get-config')

            if(!response)
                this.removeDevice(device)

            response.up = true
            this.devices[this.hash(device.id)] = response
    }  

    getDeviceList() {
        return Object.values(this.devices).filter((event) => {
            return event.up !== false
        })
    }

    getDeviceById(id){
        return this.devices[this.hash(id)]
    }

    hash(id){
        return SHA256(id)
    }

}

exports.Discovery = new NetworkService('discovery')
