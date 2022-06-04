const { spawn } = require('child_process');
const EventEmitter = require('events');
const platform = require('./platform')
const Processes = require('./processes')
const emitter = new EventEmitter();
const processes = new Processes()

//roc settings
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


class NetworkAudio {
  constructor(config) {
    this.config = config
    this.updateInterval = 1000
    this.processes = processes
    this.file = "config/rocprocesses.json"
    this.outputDriver = this.config.rx ? `-d${this.config.rx.driver}` : ''
    this.outputDevice = this.config.rx ? `-o${this.config.rx.hardware}` : ''
  }

  receive(socket) {

    if(!socket)
      return

    let rocRecv = spawn('roc-recv', ['-vv', '-s' ,`rtp+rs8m::${socket}`, '-r', `rs8m::${getRepairPort(socket)}`, this.outputDriver, this.outputDevice, rate, resampling, latency, profile, poisoning]);
    console.log('starting recv:', rocRecv.pid, this.outputDevice, this.outputDriver)
    this.processes.set({
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

  transmit(data) {
    if(!data)
      return

    let inputDriver = data.txdata.tx.driver ? "-d" + data.txdata.tx.driver : ""
    let inputDevice = data.txdata.tx.hardware ? "-i" + data.txdata.tx.hardware : ""
    let ref = `ref-${data.ip}:${data.socket}`

    if(this.processes.get(ref).toString()){
      this.keepAlive(ref)
      return
    }

    let rocSend = spawn('roc-send', ['--nbsrc=10', '--nbrpr=5', '-vv', '-s', `rtp+rs8m:${data.ip}:${data.socket}`, '-r', `rs8m:${data.ip}:${getRepairPort(data.socket)}`, '--interleaving', inputDriver, inputDevice, rate, resampling, profile, poisoning]);

    this.timeout((dead)=>{
      dead ? this.processes.kill(this.processes.get(rocSend.pid)) : ''
    }, ref) 
  
    this.processes.set({
      type : "tx",
      pid : rocSend.pid,
      ref : ref
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

  timeout(callback, id) {
    let timer = this.updateInterval * 2.5

    emitter.on(id, () => {
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
  
  keepAlive(id){
    emitter.emit(id)
  }

}


module.exports = NetworkAudio