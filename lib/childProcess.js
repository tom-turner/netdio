const pm2 = require('pm2')

class ChildProcess {

  constructor(fileName) {
    this.fileName = fileName
  }
// start application

childProcess(callback){

  pm2.connect( (err) => {
    if (err) {
      console.error(err)
      process.exit(2)
    }
  // start listen.js
  pm2.start({
    script    : './child_processes/' + this.fileName,
    name      : this.fileName
  }, (err, apps) => {

    callback({
      ProcessName: apps[0].pm2_env.name, 
      processId: apps[0].pm2_env.pm_id,
    })

    if (err) {
      console.error(err)
    }
  })
    // listen for restart me
    pm2.launchBus((err, bus) => {
      bus.on('process:msg', (packet) => {
        callback(packet.data.message)
        pm2.restart('listen') 
      })
    })
    
  })
}
}

module.exports = ChildProcess
