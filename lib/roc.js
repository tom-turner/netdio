const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path')
const EventEmitter = require('events');
const emitter = new EventEmitter();
const platform = require('./platform')
const latency = '' // --sess-latency=95ms
const profile = '' // --resampler-profile=high(slow) - medium - low(fast)
let rate = '--rate=44100'
let resampling = true
  ? ''
  : '--no-resampling'
let poisoning = false 
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
  constructor(config, updateInterval) {
    this.config = config
    this.updateInterval = updateInterval
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

    let rocRecv = spawn('roc-recv', ['-vv', '-s' ,`rtp+rs8m::${source}`, '-r', `rs8m::${getRepairPort(source)}`, this.outputDriver, this.outputDevice, rate, resampling, latency, profile, poisoning]);
    console.log('recv started', data, this.outputDevice, this.outputDriver)
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
    let source = data ? data.socket : ''
    let recv = data ? data.recv : ''
    let inputDriver = data.txdata.tx.driver ? "-d" + data.txdata.tx.driver : ""
    let inputDevice = data.txdata.tx.hardware ? "-i" + data.txdata.tx.hardware : ""
    let processId = recv

    console.log('data', data)

    if(this.get(processId).toString()){
      this.keepAlive(processId)
      return
    }

    console.log('starting', recv)

    let rocSend = spawn('roc-send', ['--nbsrc=10', '--nbrpr=5', '-vv', '-s', `rtp+rs8m:${recv}:${source}`, '-r', `rs8m:${recv}:${getRepairPort(source)}`, inputDriver, inputDevice, rate, resampling, latency, profile, poisoning]);

    this.timeout((dead)=>{
      dead ? this.kill(this.get(rocSend.pid)) : ''
    }, processId) 
  
    this.update({
      type : "tx",
      pid : rocSend.pid,
      ip : processId
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
    let timer = this.updateInterval * 2.5

    emitter.on(recv, () => {
      timer = this.updateInterval * 2.5
    })

    var timeout = setInterval( () => {

      timer = timer - this.updateInterval
      if(timer <= 0) {
        callback(true)
        clearInterval(timeout)
        } else {
          callback(false);
        }

    },this.updateInterval)
  }
  
  keepAlive(recv){
    emitter.emit(recv)
  }

}


module.exports = Roc