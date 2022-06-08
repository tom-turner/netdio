const { spawn } = require('child_process');
const EventEmitter = require('events');
const platform = require('./platform')
const processes = require('./processes')
const config = require('./config')
const { audioStream } = require('./api')
const emitter = new EventEmitter();

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

class NetworkAudio {
  constructor() {
    this.config = config
    this.updateInterval = 1000
    this.processes = processes
    this.file = "config/rocprocesses.json"
  }

  receive(socket) {

    if(!socket)
      return

    let rocRecv = spawn('roc-recv', ['-vv', '-s' ,`rtp+rs8m::${socket}`, '-r', `rs8m::${getRepairPort(socket)}`, this.config.configObject.rx.driver, this.config.configObject.rx.hardware, rate, resampling, latency, profile, poisoning]);
    console.log('starting recv:', rocRecv.pid, this.config.configObject.rx.driver, this.config.configObject.rx.hardware)
    this.processes.set({
      type : "rx",
      pid : rocRecv.pid
    })

    let stream = setInterval( async ()=>{
      return await audioStream(this.config.configObject.source).then( res => { 
        if(res.error)
          return console.log(res.error)
      })
    }, this.updateInterval )

    rocRecv.stdout.on('data', (data) => {
      console.log('rx stdout: ', data )
    })
    rocRecv.stderr.on('data', (data) => {
      console.log('rx stderr: ', data.toString('utf8'));
    });
    rocRecv.on('close', (code) => {
      if (code !== 0) {
        clearInterval(stream)
        console.log('rx process exited with code: ', code );
        rocRecv.stdin.end()
      }
    });

  }

  transmit(data) {
    if(!data)
      return

    let inputDriver = data.driver ? "-d" + data.driver : ""
    let inputDevice = data.hardware ? "-i" + data.hardware : ""
    let ref = `ref-${data.ip}:${data.socket}`


    if(this.processes.get(ref).toString()){
      console.log('keep alive')
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

const audio = new NetworkAudio()

module.exports = audio