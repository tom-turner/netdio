let SHA256 = require("crypto-js/sha256");

class Http {
  constructor(headers) {
    this.headers = headers
  }

  async request(method, url, params, body, headers) {
    if (params)
      url = url + '?' + new URLSearchParams(params).toString()

    headers = headers || {}

    return fetch(`${url}`, {
      method,
      body,
      headers: Object.fromEntries(Object.entries({ ...this.headers, ...headers }).map(([name, value]) => {
        return [name, typeof value === 'function' ? value() : value]
      }))
    }).catch(error => {
      return { error: error }
    })
  }

  async get(url, params) {  
    return await this.request('GET', url, params)
  }
  async post(url, params, body) {
    return await this.request('POST', url, params, body)
  }
}

const http = new Http({
  'Content-Type': 'application/json',
})


class NetworkServices {
      constructor(type) {
        this.updateInterval = 1000
        this.type = type
        this.http = new Http({
            'Content-Type': 'application/json',
        });
        this.port = 5050
    }

    async getServices(){
      let response = await this.http.get(`http://localhost:5050/get-bonjour-services/${this.type}`)
      
      if(response.error || response.status !== 200)
        return { error: response.error || response.status }

      return response.json()
    }

    subscribe(callback){
        // currently need to fetch devices for their configs to ensure they are up.
        // A better solution would be to use Bonjour to know when a device is down or has changed, if that functionality existed.
        // if a device disapears bojour does not remove it from the foundServices list and we still ping it, may cause issues later. 
        setInterval( async () => {
            this.services = await this.getServices()
            callback( this.services )
        }, this.updateInterval)
    }

}


class Devices {
    constructor(type) {
        this.updateInterval = 1000
        this.http = new Http({
            'Content-Type': 'application/json',
        });
        this.port = 5050
        this.type = type
        this.networkServices = new NetworkServices(type)
        this.devices = []
    }

    subscribe(callback){
        this.networkServices.subscribe((services) => {
          callback(this.getDeviceList(this.devices))
          
          if(services.error){
            return this.devices = []
          }

          services.map( async (service) => {
            let deviceConfig = await this.getDeviceConfig(service)
            console.log(deviceConfig)
            if(!deviceConfig)
                  return this.removeDevice(service)

            return this.devices[this.hash(service.id)] = deviceConfig  
          })
      
        })
    }

    async getDeviceConfig(device){
        let result = await this.http.get(`http://${device.ip}:${this.port}/get-config/${this.type}`)
        if(!result)
          return this.removeDevice(device)

        if(result.error) 
            return this.removeDevice(device)

        return result.json()
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

exports.NetworkServices = (type) => {
  return new NetworkServices(type)
}
exports.Tx = new Devices('tx')
exports.Rx = new Devices('rx')