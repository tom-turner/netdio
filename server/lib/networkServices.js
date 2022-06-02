const fetch = require('node-fetch');
let SHA256 = require("crypto-js/sha256");
let bonjour = require('bonjour')({
    multicast: true,
    loopback: true
})

class Http {
    constructor(headers) {
        this.headers = headers
    }

    async request(method, url, params, body, headers) {
        if (params)
          url = url + '?' + new URLSearchParams(params).toString()

        headers = headers || {}

        try {
            return fetch(`${url}`, {
              method,
              body,
              credentials: 'include',
              headers: Object.fromEntries(Object.entries({ ...this.headers, ...headers }).map(([name, value]) => {
                return [name, typeof value === 'function' ? value() : value]
              }))
            })
        } catch(error) {
            return { error: error }
        }
    }

    async get(url, params) { return this.request('GET', url, params) }
    async post(url, params, body) { return this.request('POST', url, params, body) }
}


class NetworkServices {
    constructor(type) {
        this.http = new Http();
        this.port = process.env.PORT 
        this.config = require('./config')();
        this.type = type
        this.foundServices = bonjour.find({ type: this.type }).services
        this.updateInterval = 1000
        this.devices = []
    }

    parseBonjour(service){
        return {
            ip: service.referer.address,
            id: service.name,
            config: JSON.parse(Object.values(service.txt).join(''))
        } 
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
    
    subscribe(callback){
        // currently need to fetch devices for their configs to ensure they are up.
        // A better solution would be to use Bonjour to know when a device is down or has changed, if that functionality existed.
        // if a device disapears bojour does not remove it from the foundServices list and we still ping it, may cause issues later. 
        setInterval( async () => {
            for (var service of this.foundServices) {
                let device = this.parseBonjour(service)
                let deviceConfig = await this.getDeviceConfig(device)
                if(!deviceConfig)
                    return

                this.devices[this.hash(device.id)] = deviceConfig  
            }
            callback(this.getDeviceList()) 
        }, this.updateInterval)
    }

    removeDevice(device){
        delete this.devices[this.hash(device.id)] 
    }

    async getDeviceConfig(device){
        let fetch = await this.http.get(`http://${device.ip}:${this.port}/get-config`)
        let result = fetch.json()

        if(result.error) 
            return this.removeDevice(device)
        

        return result
    }  

    getDeviceList() {
        return Object.values(this.devices)
    }

    getDeviceById(id){
        return this.devices[this.hash(id)]
    }

    hash(id){
        return SHA256(id)
    }

}

exports.Http = Http
exports.Network = new NetworkServices('network')
exports.Spotify = new NetworkServices('spotify')
