const fetch = require('node-fetch');
let port = process.env.REACT_APP_SERVER_PORT || 5050

class Http {
    constructor(headers) {
        this.headers = headers
        this.port = port
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
        }).catch((error) => {
            return { error: error, status : 400 }
        })
    }

    async get(url, params) {
        return await this.request('GET', url, params).then( res => {
            if(res.status !== 200)
                return { error: res.status }

            return res.json()
        })
    }

    async post(url, params, body) {
        return await this.request('POST', url, params, body).then( res => {
            if(res.status !==200)
                return { error: res.status }

            return res.json()            
        })
    }

}

let http = new Http({
    'Content-Type': 'application/json',
    'Authorization': () => process.env.REACT_APP_AUTHORIZATION,
    'Accept': '*'
});


let audioStream = async (source, rx) => {
    let result = await http.post(`http://${source.ip}:${port}/audio-stream`, null, JSON.stringify({ ...source, rxIp: rx.ip, rxSocket: rx.socket }))
    if(result.error) 
        return { error: result.error }

    return result
}

module.exports.audioStream = audioStream