const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path')
const EventEmitter = require('events');
const emitter = new EventEmitter();
const timeoutInMs = 2000
const interval = 100
const latency = '75ms'
const profile = 'low' // high(slow) - medium - low(fast) 
let poisoning = false 
  ? '--poisoning' 
  : ''
let driver = process.platform === 'linux'
  ? ''
  : ''

function getRepairPort(input) {
  var input = Number(input)
  var calc = input + 1000
  return calc.toString()
}

function notEqual(arr1, arr2){
  return JSON.stringify(arr1) != JSON.stringify(arr2)  
}

class Roc {
  constructor(config) {
    this.config = config
    this.childProcesses = []
    this.file = "config/runningprocesses.json"
  }

  savedProcesses(){
    return JSON.parse(fs.readFileSync(this.file))
  }

  depreciated() {
      let depreciated = this.savedProcesses().filter( (obj) =>{
      let compare = this.get(obj.pid)[0] ? this.get(obj.pid)[0] : '';
        return obj.pid !== compare.pid
      })
      return depreciated
  }

  update(data){
    this.kill(this.depreciated())
    this.childProcesses.push(data)

    fs.writeFileSync( this.file , JSON.stringify(this.childProcesses)), (err) => {
      if (err) { console.log(err) } 
    }
  }

  get(value){
    return this.childProcesses.filter((item) => {
      if (value) {
        return item.type == value || item.pid == value || item.ip == value
      } else return true
    })
  }

  kill(array){
    for ( var obj of array) {
      console.log(1, obj)
      this.childProcesses = this.childProcesses.filter((item) => {
        return item !== this.get(obj.pid)[0]
      })
      console.log(2, this.childProcesses)
      try { 
        process.kill(obj.pid)
        console.log(obj.pid, 'killed')
      } catch {
        console.log(obj.pid, 'process already dead')
      }
    }
  }

  rocRecv(data) {
    let source = this.config.source.socket ? this.config.source.socket : ''
    
    if(data) {
      source = data.socket
    }
    
    let rocRecv = spawn('roc-recv', ['-vv', '-s' ,`rtp+rs8m::${source}`, '-r', `rs8m::${getRepairPort(source)}`, driver, `--sess-latency=${latency}`,`--resampler-profile=${profile}`, poisoning]);
    
    this.update({
      type : "rx",
      pid : rocRecv.pid
    })

    rocRecv.stdout.on('data', (data) => {
      console.log('rx stdout: ', data )
    })
    rocRecv.stderr.on('data', (data) => {
      console.log('rx stderr: ', data.toString('utf8'));
      rocRecv.stdin.end()
    });
    rocRecv.on('close', (code) => {
      if (code !== 0) {
        console.log('rx process exited with code: ', code );
        rocRecv.stdin.end()
      }
    });
  }

  rocSend(data) {
    let source = data ? data.socket : this.config.tx.source
    let recv = data ? data.recv : ''

    if(this.get(recv).toString()){
      console.log('keep alive')
      this.keepAlive(recv)
      return
    }

    let rocSend = spawn('roc-send', ['--nbsrc=10', '--nbrpr=5', '-vv', '-s', `rtp+rs8m:${recv}:${source}`, '-r', `rs8m:${recv}:${getRepairPort(source)}`, driver, `--resampler-profile=${profile}`, poisoning]);

    this.timeout((dead)=>{
      console.log(dead, rocSend.pid)
      dead ? this.kill(this.get(rocSend.pid)) : ''
    }, recv) 
  
    this.update({
      type : "tx",
      pid : rocSend.pid,
      ip : recv
    })
    rocSend.stdout.on('data', (data) => {
      console.log('tx stdout: ', data )
    })
    rocSend.stderr.on('data', (data) => {
      console.log('tx stderr: ', data.toString('utf8'));
      rocSend.stdin.end()
    });
    rocSend.on('close', (code) => {
      if (code !== 0) {
        console.log('tx process exited with code: ', code );
        rocSend.stdin.end()
      } 
    });
  }

  timeout(callback, recv) {
    let timer = timeoutInMs

    emitter.on(recv, () => {
      timer = timeoutInMs
    })

    var timeout = setInterval( () => {

      timer = timer - interval
      if(timer <= 0) {
        console.log(timer)
        callback(true)
        clearInterval(timeout)
        } else {
          console.log(timer)
          callback(false);
        }

    },interval)
  }
  
  keepAlive(recv){
    emitter.emit(recv)
  }

}


module.exports = Roc