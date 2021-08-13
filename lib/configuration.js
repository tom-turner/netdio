const fs = require('fs')

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
    // not really a hash but just need a string from an IP input to use as a unique ID
    const chars = ['a','b','c','e','e','f','g','h','i','j']
    let hash = ''

    for ( var i of input.split('')) {
      var char = i == '.' ? chars[9] : chars[i]
      hash = hash + char 
    }

    return hash
  }

  doesNotExist(element, array){
    return !array.includes(element) 
  }

  debouncedSet(key, value) {
    this.config()[key] = value
    this.debouncedSave()
  }
}

module.exports = Configuration
