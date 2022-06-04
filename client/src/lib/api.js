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
        this.services = []
        this.devices = []
        this.error = null
    }

    async subscribe(callback){
      setInterval( async () => { // can we get callbacks from devices when their state changes instead of polling them?
        let services = await this.networkServices.getServices()
        if(services.error)
          this.error = services.error
        else 
          this.services = services
        
        this.services.map( async (service) => {
          let deviceConfig = await this.getDeviceConfig(service)
          if(!deviceConfig)
                return this.removeDevice(service)

          return this.devices[this.hash(service.id)] = deviceConfig  
        })

        callback({
          devices: this.getDeviceList(this.devices),
          error: this.error
        })
        
      }, this.updateInterval)
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

let http = new Http({
    'Content-Type': 'application/json',
});

let setReceiverSource = async (ip, tx) => {
  return http.post(`http://${ip}:${5050}/set-receiver-source`, null, JSON.stringify(tx)).then(res => res.json())
}

let setVolume = async (ip, value) => {
  return http.post(`http://${ip}:${5050}/set-volume`, null, JSON.stringify({ value: value })).then(res => res.json())
}


exports.NetworkServices = (type) => {
  return new NetworkServices(type)
}
exports.Tx = new Devices('tx')
exports.Rx = new Devices('rx')
module.exports.setReceiverSource = setReceiverSource
module.exports.setVolume = setVolume