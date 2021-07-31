const { spawn } = require('child_process');
const fs = require('fs');
const Configuration = require('../lib/configuration')
const path = require('path')
const multicastIp = '224.0.0.1'

process.on('message', packet => {
  switch (packet.type) {
    case 'startReceive':
      startRx(packet.config)
      break
    case 'startTransmit':
      startTx(packet.config)
      break
    default:
      console.log(`Recieve: didn't understand message type ${packet.type}`)
  }
})

function startRx(config) {

  console.log(config)
  var sourcePort = config.source.value
  var repairPort = getRepairPort(sourcePort)

  console.log('Started Receive Process')

  driver = process.platform === 'linux'
    ? '-d alsa'
    : ''

  var rocRecv = spawn('roc-recv', ['-vv', '-s', `rtp+rs8m:${multicastIp}:${sourcePort}`, '-r', `rs8m:${multicastIp}:${repairPort}`, driver]);
  rocRecv.stdout.on('data', (data) => {
    console.log('stdout: ', data )
  })
  rocRecv.stderr.on('data', (data) => {
    console.error('ps stderr: ', data.toString('utf8'));
    // restartProcess(data)
  });
  rocRecv.on('close', (code) => {
    if (code !== 0) {
      console.log('ps process exited with code: ', code );
      rocRecv.stdin.end();
      // restartProcess()
    }
  });
}

function startTx(config) {

  console.log("tx", config)
  var sourcePort = config.source
  var repairPort = getRepairPort(sourcePort)

  console.log('Started Receive Process')

  driver = process.platform === 'linux'
    ? '-d alsa'
    : ''

  var rocSend = spawn('roc-send', ['-vv', '-s', `rtp+rs8m:${multicastIp}:${sourcePort}`, '-r', `rs8m:${multicastIp}:${repairPort}`, driver]);
  rocSend.stdout.on('data', (data) => {
    console.log('stdout: ', data )
  })
  rocSend.stderr.on('data', (data) => {
    console.error('ps stderr: ', data.toString('utf8'));
    // restartProcess(data)
  });
  rocSend.on('close', (code) => {
    if (code !== 0) {
      console.log('ps process exited with code: ', code );
      rocSend.stdin.end();
      // restartProcess()
    }
  });
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
