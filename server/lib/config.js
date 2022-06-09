const fs = require('fs')
const SHA256 = require("crypto-js/sha256");
const configFile = 'config/config.json'

function debounce(fn, timeout) {
  let interval = null

  return function (...args) {
    if (interval)
      clearInterval(interval)

    interval = setTimeout(function () {
      fn.apply(null, args)
    }, timeout)
  }
}

class Configuration {
  constructor(configFile, type, debounceTimeout) {
    this.configFile = configFile
    this.debouncedSave = debounce(() => this.save(), debounceTimeout || 100)
  }

  getFirstRunConfig(){
    let services = process.env.SERVICES.split(',')
    let config = {}

    for (let service of services){
      config[service] = {}
    }

    return config
  }

  config() {
    if (!this.configObject)
      if (fs.existsSync(this.configFile))
        this.configObject = JSON.parse(fs.readFileSync(this.configFile))
      else
        this.configObject = this.getFirstRunConfig()

    return this.configObject
  }

  async save() {
    return new Promise((resolve, reject) => {
      if (this.configFile)
        fs.writeFileSync(this.configFile, JSON.stringify(this.config()), (err) => {
          if (err) {
            console.error('An error occoured whilst writing:', err.message)
            throw err
          }
          resolve()
        })
    })
  }

  get(key) {
    return this.config()[key]
  }

  async set(path, value) {
    let config = this.config()
    let keys = path.split('.')
    var pathkeys = keys.slice(0,-1)
    var lastkey = keys.slice(-1)[0]

    for (let key of pathkeys) {
      config = config[key]
    }
    config[lastkey] = value
    await this.save()
  }

  hash(input){
    return SHA256(input).toString()
  }

  getNewPort(){
    var min = 10000
    var max = 49000
    var num = Math.floor(Math.random() * (max - min + 1 )) + min 
    return num.toString()
  }
  
  debouncedSet(key, value) {
    this.config()[key] = value
    this.debouncedSave()
  }
}

const config = new Configuration(configFile)

module.exports = config
