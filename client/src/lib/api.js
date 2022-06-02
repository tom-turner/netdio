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
    })
  }

  async get(url, params) { return this.request('GET', url, params) }
  async post(url, params, body) { return this.request('POST', url, params, body) }
  async delete(url, params) { return this.request('DELETE', url, params) }
  async put(url, params, body, headers) { return this.request('PUT', url, params, body, headers) }
}

const http = new Http({
  'Content-Type': 'application/json',
})

let getNetworkDeviceList = async (query) => {
  return http.get(`http://localhost:5050/get-network-device-list`)
    .then(res => res.json())
}

module.exports.getNetworkDeviceList = getNetworkDeviceList