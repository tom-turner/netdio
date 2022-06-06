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
        let getNetworkState = async () => {
            let services = await getBonjourServices(this.type)

            if(!services || services.error)
              this.error = services.error
            else 
              this.services = services
            
            this.services.map( async (service) => {
              let deviceConfig = await getDeviceConfig(service, this.type)

              if(!deviceConfig || deviceConfig.error)
                    return this.removeDevice(service)

              return this.devices[this.hash(service.id)] = deviceConfig  
            })

            callback({
              devices: this.getDeviceList(this.devices),
              error: this.error
            })
        }
        getNetworkState()
        setInterval( async () => { getNetworkState() }, this.updateInterval)
    }


    removeDevice(device){
        delete this.devices[this.hash(device.id)] 
    }

    getDeviceList() {
        return Object.values(this.devices)
    }

    hash(input){
        return SHA256(input).toString()
    }
}

exports.Tx = new Devices('tx')
exports.Rx = new Devices('rx')

