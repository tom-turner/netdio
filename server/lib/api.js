const fetch = require('node-fetch');

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
          credentials: 'include',
          headers: Object.fromEntries(Object.entries({ ...this.headers, ...headers }).map(([name, value]) => {
            return [name, typeof value === 'function' ? value() : value]
          }))
        }).catch((error) => {
            return { error: error, status : 400 }
        })
    }

    async get(url, params) {
        let response = await this.request('GET', url, params)
        if(response.status !== 200)
            return { error: response.status }

        return response.json()
    }
    async post(url, params, body) {
        let response = await this.request('POST', url, params, body)
        if(response.status !==200)
            return { error: response.status }

        return response.json()
    }
}

let http = new Http({
    'Content-Type': 'application/json',
    'Authorization': () => process.env.AUTH,
    'Accept': '*'
});

let getDeviceConfig = async (device) => {
    let result = await http.get(`http://${device.ip}:${process.env.PORT}/get-config/${this.type}`)
    
    if(result.error) 
        return this.removeDevice(device)

    return result
}  

let audioStream = async (source) => {
    let result = await http.post(`http://${source.ip}:${process.env.PORT}/audio-stream`, null, JSON.stringify(source))
    if(result.error) 
        return 

    return result
}


module.exports.getDeviceConfig = getDeviceConfig
module.exports.audioStream = audioStream