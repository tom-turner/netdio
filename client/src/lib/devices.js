let SHA256 = require("crypto-js/sha256");
let { getBonjourServices, getDeviceConfig } = require("./api");

class Devices {
    constructor(type) {
        this.updateInterval = process.env.REACT_APP_UPDATE_INTERVAL || 1000
        this.type = type
        this.services = []
        this.devices = []
    }

    async subscribe(callback){
        let updateDevices = async () => {
            let services = await getBonjourServices(this.type)

            if(!services || services.error)
                callback({ error: services.error })
            else 
                this.services = services

            return this.services.map( async (service) => {
                let deviceConfig = await getDeviceConfig(service, this.type)

                // LOGGING -- encounters a weird bug the getDeviceConfig fetch error does not reach here sometimes, but not all. No idea what is going on.
                deviceConfig.error ? console.log(2, deviceConfig.error ) : console.log() 

                if(!deviceConfig || deviceConfig.error){
                    if(!this.changed(service, deviceConfig))
                        return

                    this.removeDevice(service)
                    return callback({ devices: this.getDeviceList() })
                } else {
                    if(!this.changed(service,deviceConfig))
                        return

                    this.addDevice(service, deviceConfig)
                    return callback({ devices: this.getDeviceList() }) 
                }
            })
        }
        
        //updateDevices()
        callback({ devices: this.getDeviceList() }) 
        setInterval( async () => {
            updateDevices()
        }, this.updateInterval)
    }


    removeDevice(service){
        delete this.devices[this.hash(service.ip)]
        return
    }

    addDevice(service, config){
        return this.devices[this.hash(service.ip)] = config
    }

    exists(service){
        return this.devices[this.hash(service.ip)] ? true : false
    }

    changed(service, config){
        return JSON.stringify(this.devices[this.hash(service.ip)]) !== JSON.stringify(config)
    }

    getDeviceList(input) {
        return Object.values( input || this.devices)
    }

    hash(input){
        return SHA256(input).toString()
    }
}

exports.Tx = new Devices('tx')
exports.Rx = new Devices('rx')
exports.Spotify = new Devices('spotify')

