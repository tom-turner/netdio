const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path')
const EventEmitter = require('events');
const emitter = new EventEmitter();
const platform = require('./platform')
const timeoutInMs = 2500
const interval = 100
const latency = '95ms'
const profile = 'low' // high(slow) - medium - low(fast)
let noresampling = false
  ? ''
  : '--no-noresampling'
let poisoning = true 
  ? '--poisoning' 
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
    this.file = "config/rocprocesses.json"
    this.outputDriver = this.config.rx ? `-d${this.config.rx.driver}` : ''
    this.outputDevice = this.config.rx ? `-o${this.config.rx.hardware}` : ''
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

  update(data){
    this.kill(this.depreciated())
    this.childProcesses.push(data)

    fs.writeFileSync( this.file , JSON.stringify(this.childProcesses)), (err) => {
      if (err) { console.log("error", err) } 
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
      this.childProcesses = this.childProcesses.filter((item) => {
        return item !== this.get(obj.pid)[0]
      })
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

    let rocRecv = spawn('roc-recv', ['-vv', '-s' ,`rtp+rs8m::${source}`, '-r', `rs8m::${getRepairPort(source)}`, this.outputDriver, this.outputDevice, noresampling, `--sess-latency=${latency}`,`--resampler-profile=${profile}`, poisoning]);
    
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
    let inputDriver = data.txdata.tx.driver ? "-d" + data.txdata.tx.driver : ""
    let inputDevice = data.txdata.tx.hardware ? "-i" + data.txdata.tx.hardware : ""

    if(this.get(recv).toString()){
      this.keepAlive(recv)
      return
    }

    let rocSend = spawn('roc-send', ['--nbsrc=10', '--nbrpr=5', '-vv', '-s', `rtp+rs8m:${recv}:${source}`, '-r', `rs8m:${recv}:${getRepairPort(source)}`, noresampling, inputDriver, inputDevice, `--resampler-profile=${profile}`, poisoning]);

    this.timeout((dead)=>{
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
        callback(true)
        clearInterval(timeout)
        } else {
          callback(false);
        }

    },interval)
  }
  
  keepAlive(recv){
    emitter.emit(recv)
  }

}


module.exports = Roc