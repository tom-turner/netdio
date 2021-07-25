const describe = require('../../lib/describe')
const assert = require('assert')
const Configuration = require('../../lib/configuration')
const fs = require('fs')

describe('Configuration', (it, describe) => {
  it('should create a new configuration object', () => {
    let config = new Configuration()
  })

  describe('.config()', (it, when) => {
    when("the config file doesn't exist", (it) => {
      it('should be an empty object', () => {
        let config = new Configuration()
        assert(JSON.stringify(config.config()) === '{}')
      })
    })

    when('the config file does exist', (it) => {
      const testConfig = { test: true }
      const testConfigName = './test-conf.json'
      fs.writeFileSync(testConfigName, JSON.stringify(testConfig))

      it('should have valid keys from the test config', () => {
        let config = new Configuration(testConfigName)
        assert(config.config().test)
      })
     
      fs.unlinkSync(testConfigName)
    })
  })

  describe('.get(key)', (it) => {
    it('should return the value for the given key', () => {
      let config = new Configuration()
      config.set('test', true)
      assert(config.get('test'))
    })
  })

  describe('.set(key, value)', (it) => {
    it('should set the given key to the value', () => {
      let config = new Configuration()
      config.set('test', false)
      assert(config.get('test') === false)
    })
  })
})
