const { spawn } = require('child_process');
const fs = require('fs');
const Configuration = require('../lib/configuration')
const path = require('path')
const EventEmitter = require('events');
const emitter = new EventEmitter();
const multicastIp = '224.0.0.1'
const latency = '500ms'
const profile = 'low' // high(slow) - medium - low(fast) 
let poisoning = true 
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


class Roc {
  constructor(config) {
    this.config = config
    this.childProcesses = []
    console.log(config)
  }

  get(value){
    return this.childProcesses.filter((item) => {
      if (value) {
        return item.type == value || item.pid == value
      } else return true
    })
  }

  kill(items){
    for ( var item of items) {
      var processId = item.pid
      process.kill(processId)
      delete this.childProcesses[processId]
    }
  }

  startRocRecv(callback) {
    let source = this.config.rx.source ? this.config.rx.source : ''
    let rocRecv = spawn('roc-recv', ['-vv', '-s' ,`rtp+rs8m::${source.value}`, '-r', `rs8m::${getRepairPort(source.value)}`, driver, `--sess-latency=${latency}`,`--resampler-profile=${profile}`, poisoning]);
    
    this.childProcesses.push({
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

  startRocSend(callback) {
    let source = this.config.tx ? this.config.tx.source : ''
    let rocSend = spawn('roc-send', ['--nbsrc=10', '--nbrpr=5', '-vv', '-s', `rtp+rs8m:${multicastIp}:${source}`, '-r', `rs8m:${multicastIp}:${getRepairPort(source)}`, driver, `--resampler-profile=${profile}`, poisoning]);
    
    this.childProcesses.push({
      type : "tx",
      pid : rocSend.pid
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
  
}


module.exports = Roc