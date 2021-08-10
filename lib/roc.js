const { spawn } = require('child_process');
const fs = require('fs');
const Configuration = require('../lib/configuration')
const path = require('path')
const EventEmitter = require('events');
const emitter = new EventEmitter();
const multicastIp = '224.0.0.1'

process.on('message', packet => {
  switch (packet.type) {
    case 'startReceive':
      startRx(packet.config)
      break
    case 'startTransmit':
      startTx(packet.config)
      break
    case 'end':
      emitter.emit('end')
      process.exit()
      break
    default:
      console.log(`Roc: didn't understand message.`)
  }
})

function startRx(config) {

  console.log("rx started")
  var sourcePort = config.source.value
  var repairPort = getRepairPort(sourcePort)

  console.log('Started Receive Process')

  driver = process.platform === 'linux'
    ? ''
    : ''

  var rocRecv = spawn('roc-recv', ['-vv', '-s' ,`rtp+rs8m::${sourcePort}`, '-r', `rs8m::${repairPort}`, driver, '--sess-latency=50ms','--resampler-profile=high']);
  rocRecv.stdout.on('data', (data) => {
    console.log('rx stdout: ', data )

  })
  rocRecv.stderr.on('data', (data) => {
    console.error('rx stderr: ', data.toString('utf8'));
    // restartProcess(data)
    
  });
  rocRecv.on('close', (code) => {
    if (code !== 0) {
      console.log('rx process exited with code: ', code );
      rocRecv.stdin.end();
      // restartProcess()
    }
  });
  emitter.on('end', () => {
    rocRecv.kill()
  })

}

function startTx(config) {

  console.log("tx started")
  var sourcePort = config.source
  var repairPort = getRepairPort(sourcePort)

  console.log('Started Receive Process')

  driver = process.platform === 'linux'
    ? ''
    : ''


  var rocSend = spawn('roc-send', ['--nbsrc=20', '--nbrpr=10', '-vv', '-s', `rtp+rs8m:${multicastIp}:${sourcePort}`, '-r', `rs8m:${multicastIp}:${repairPort}`, driver, '--resampler-profile=high']);
  rocSend.stdout.on('data', (data) => {
    console.log('tx stdout: ', data )
  })
  rocSend.stderr.on('data', (data) => {
    console.error('tx stderr: ', data.toString('utf8'));
    // restartProcess(data)
  });
  rocSend.on('close', (code) => {
    if (code !== 0) {
      console.log('tx process exited with code: ', code );
      rocSend.stdin.end();
      // restartProcess()
    }
  });
  emitter.on('end', () => {
    rocSend.kill()
  })
}

function getRepairPort(input) {
  var input = Number(input)
  // puts repair port 1000 above source
  var calc = input + 1000
  return calc.toString()
}

function restartProcess(err) {
  process.send({
    type : 'process:msg',
    data : {
      message : 'Restart Me Please',
      error: err,
      success : true
    }
  });
}
