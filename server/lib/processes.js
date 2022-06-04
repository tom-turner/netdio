const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path')
const EventEmitter = require('events');
const emitter = new EventEmitter();

class Processes {
  constructor(config) {
    this.config = config
    this.childProcesses = []
    this.file = "config/runningprocesses.json"
  }

  savedProcesses(){
    if(!fs.existsSync(this.file)) {
      fs.writeFileSync(this.file, '[]')
    }
    return JSON.parse(fs.readFileSync(this.file))
  }

  depreciated() {
      let depreciated = this.savedProcesses().filter( (obj) =>{
      let compare = this.get(obj.pid)[0] ? this.get(obj.pid)[0] : '';
        return obj.pid !== compare.pid
      })
      return depreciated
  }

  set(data){
    this.kill(this.depreciated())
    this.childProcesses.push(data)

    fs.writeFileSync( this.file , JSON.stringify(this.childProcesses)), (err) => {
      if (err) { "err", console.log(err) } 
    }
  }

  get(value){
    return this.childProcesses.filter((item) => {
      if (value) {
        return item.type == value || item.pid == value || item.ref == value
      } else return true
    })
  }

  kill(array){
    
    if(array.length === 0)
      return console.log('process not in array: likely already dead')

    for ( var obj of array) {
      this.childProcesses = this.childProcesses.filter((item) => {
        return item !== this.get(obj.pid)[0]
      })
      try { 
        process.kill(obj.pid)
        console.log('killing old procesess:', obj.pid, 'killed')
      } catch {
        console.log('killing old procesess:', obj.pid, 'process already dead')
      }
    }
  }

}

module.exports = Processes