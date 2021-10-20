const EventEmitter = require('events');
const emitter = new EventEmitter();
let bonjour = require('bonjour')()
let type = 'duckado-config'

class Devices {
    constructor(config) {
        this.config = config
        this.options = {
            name: this.config.device.id, 
            type: type,
            host: '224.0.1.1',
            port: 20000, 
            txt: ({ message: JSON.stringify( this.config ) }) 
        }
        this.service = bonjour.publish(this.options)
        this.find = bonjour.find({ type: type })
        
    }

    getDevices() {
        return this.find.services.filter( (event) => {
            console.log(event)
            return event.type == type
        })
    }

   	forward(device, message, callback ) {

    }

    receive(type, message, callback ) {

    }

}

module.exports = Devices
