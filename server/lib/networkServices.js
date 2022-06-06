const config = require('./config')
let bonjour = require('bonjour')({
    multicast: true,
    loopback: true
})

class NetworkServices {
    constructor(type) {
        this.config = config
        this.type = type
        this.foundServices = bonjour.find({ type: this.type }).services
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
    
    getServiceList(){
        return this.foundServices.map((service)=>{
            return this.parseBonjour(service)
        })
    }

}

exports.Tx = new NetworkServices('tx')
exports.Rx = new NetworkServices('rx')
exports.Spotify = new NetworkServices('spotify')
