const fs = require('fs')
const ip = require('./getIp')();
const SHA256 = require("crypto-js/sha256");

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
    new Setup(this)
  }

  config() {
    if (!this.configObject)
      if (fs.existsSync(this.configFile))
        this.configObject = JSON.parse(fs.readFileSync(this.configFile))
      else
        this.configObject = JSON.parse(fs.readFileSync("config/startupconfig.json"))

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

class Setup{
  constructor(config){
    this.config = config
    this.ip();
    this.id();
    this.tx();
    this.rx();
  }

  ip(){
    this.config.set("device.ip", require('./getIp')() )
    return this.config.get('device')['ip']
  }

  id(){
    this.config.set("device.id", this.config.hash(this.ip()))
    return this.config.get('device')['id']
  }

  tx() {
    if(!this.config.get('tx'))
      return

    this.config.set('tx.ip', this.ip() )
    this.config.set('tx.id', this.id() )

    if(!this.config.get('tx')['socket'])
      this.config.set( "tx.socket", this.config.getNewPort() )

    return this.config.get('tx')
  }

  rx() {
    if(!this.config.get('rx'))
      return

    this.config.set('rx.ip', this.ip() )
    this.config.set('rx.id', this.id() )

    if(!this.config.get('source'))
      this.config.set( "source.name", '-Mute-' )

    return this.config.get('rx')
  }
}


module.exports = (configFile) => {
  return new Configuration( configFile || 'config/config.json')
}
