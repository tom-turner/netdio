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
  constructor(configFile, debounceTimeout) {
    this.configFile = configFile
    this.debouncedSave = debounce(() => this.save(), debounceTimeout || 100)
  }

  config() {
    if (!this.configObject)
      if (fs.existsSync(this.configFile))
        this.configObject = JSON.parse(fs.readFileSync(this.configFile))
      else
        this.configObject = {}

    return this.configObject
  }

  async save() {
    return new Promise((resolve, reject) => {
      fs.writeFile(this.configFile, JSON.stringify(this.configObject), (err) => {
        if (err) return reject(err)
        resolve()
      })
    })
  }

  get(key) {
    return this.config()[key]
  }

  async set(key, value) {
    this.config()[key] = value
    await this.save()
  }

  debouncedSet(key, value) {
    this.config()[key] = value
    this.debouncedSave()
  }
}

module.exports = Configuration
