let serverPort = process.env.REACT_APP_SERVER_PORT || 5050

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

let http = new Http({
    'Content-Type': 'application/json',
    'Authorization': () => process.env.REACT_APP_AUTHORIZATION,
    'Accept': '*'
});

let setReceiverSource = async (ip, tx) => {
  return http.post(`http://${ip}:${serverPort}/set-receiver-source`, null, JSON.stringify(tx)).then(res => res.json())
}

let setVolume = async (ip, value) => {
  return http.post(`http://${ip}:${serverPort}/set-volume`, null, JSON.stringify({ value: value })).then(res => res.json())
}

let setName = async (ip, type, value) => {
  return http.post(`http://${ip}:${serverPort}/set-name/${type}`, null, JSON.stringify({ value: value })).then(res => res.json())
}

let setGroup = async (ip, value) => {
  return http.post(`http://${ip}:${serverPort}/set-group`, null, JSON.stringify({ value: value })).then(res => res.json())
}

let setEq = async (ip, param, value) => {
  return http.post(`http://${ip}:${serverPort}/set-eq`, null, JSON.stringify({ param:param, value: value })).then(res => res.json())
}

let setEqFlat = async (ip) => {
  return http.post(`http://${ip}:${serverPort}/set-eq-flat`, null, null ).then(res => res.json())
}

let resetDevice = async (ip) => {
  return http.post(`http://${ip}:${serverPort}/reset`, null, null).then(res => res.json())
}

let resetSpotify = async (ip) => {
  return http.post(`http://${ip}:${serverPort}/reset-spotify`, null, null).then(res => res.json())
}

let getBonjourServices = async (type) => {
  let response = await http.get(`http://${window.location.hostname}:${serverPort}/get-bonjour-services/${type}`)

  if(response.error || response.status !== 200)
    return { error: response.error || response.status }

  return response.json()
}

let getDeviceConfig = async (device, type) => {
  let response = await http.get(`http://${device.ip}:${serverPort}/get-config${type ? '/' + type : ''}`)
  
  if(response.error || response.status !== 200)
    return { error: response.error || response.status }

  return response.json()
}

let getEq = async (ip) => {
  let response = await http.get(`http://${ip}:${serverPort}/get-eq`)
  
  if(response.error || response.status !== 200)
    return { error: response.error || response.status }

  return response.json()
}

module.exports.setReceiverSource = setReceiverSource
module.exports.setVolume = setVolume
module.exports.setName = setName
module.exports.setGroup = setGroup
module.exports.setEq = setEq
module.exports.setEqFlat = setEqFlat
module.exports.resetDevice = resetDevice
module.exports.resetSpotify = resetSpotify
module.exports.getBonjourServices = getBonjourServices
module.exports.getDeviceConfig = getDeviceConfig
module.exports.getEq = getEq


