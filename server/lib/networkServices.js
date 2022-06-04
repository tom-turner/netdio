const config = require('./config')();
let { getDeviceConfig } = require('./api')
let SHA256 = require("crypto-js/sha256");
let bonjour = require('bonjour')({
    multicast: true,
    loopback: true
})

class NetworkServices {
    constructor(type) {
        this.config = config
        this.port = process.env.PORT 
        this.type = type
        this.foundServices = bonjour.find({ type: this.type }).services
        this.updateInterval = 1000
        this.devices = []
    }

    parseBonjour(service){
        return {
            ip: service.referer.address,
            id: service.name,
            type: this.type
        } 
    }

    publish(config){
        return bonjour.publish({
            name: `${this.type}-${this.config.configObject.device.id}`|| `${this.type}-${this.config.get('device.id')}`,
            type: this.type,
            host: '224.0.1.1',
            port: 20000,
            txt: JSON.stringify( config || this.type ) // currently not using config on bojour as its not updateable.
        })
    }
    
    subscribe(){
        // currently need to fetch devices for their configs to ensure they are up.
        // A better solution would be to use Bonjour to know when a device is down or has changed, if that functionality existed.
        // if a device disapears bojour does not remove it from the foundServices list and we still ping it, may cause issues later. 
        setInterval( async () => {
            for (var service of this.foundServices) {
                let device = this.parseBonjour(service)
                let deviceConfig = await this.getDeviceConfig(device)
                if(!deviceConfig)
                    return

                return this.devices[this.hash(device.id)] = deviceConfig  
            }
        }, this.updateInterval)
    }

    removeDevice(device){
        delete this.devices[this.hash(device.id)] 
    }


    getDeviceList() {
        return Object.values(this.devices)
    }

    getServiceList(){
        return this.foundServices.map((service)=>{
            return this.parseBonjour(service)
        })
    }

    getDeviceById(id){
        return this.devices[this.hash(id)]
    }

    hash(input){
        return SHA256(input).toString()
    }

}

exports.Tx = new NetworkServices('tx')
exports.Rx = new NetworkServices('rx')
exports.Spotify = new NetworkServices('spotify')