let SHA256 = require("crypto-js/sha256");
let { getBonjourServices, getDeviceConfig } = require("./api");

class Devices {
    constructor(type) {
        this.updateInterval = process.env.REACT_APP_UPDATE_INTERVAL || 1000
        this.type = type
        this.services = []
        this.devices = []
        this.error = null
    }

    async subscribe(callback){
        let updateDevices = async () => {
            let services = await getBonjourServices(this.type)

            if(!services || services.error)
                this.error = services.error
            else 
                this.services = services
                   
            return this.services.map( async (service) => {
                let deviceConfig = await getDeviceConfig(service, this.type)
            
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
        updateDevices()
        callback({ devices: this.getDeviceList() }) 
        setInterval( async () => {
            updateDevices()
        }, this.updateInterval)
    }


    removeDevice(service){
        return delete this.devices[this.hash(service.id)]
    }

    addDevice(service, config){
        return this.devices[this.hash(service.id)] = config
    }

    exists(service){
        return this.devices[this.hash(service.id)] ? true : false
    }

    changed(service, config){
        return JSON.stringify(this.devices[this.hash(service.id)]) !== JSON.stringify(config)
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

