const { spawn } = require('child_process');
const fs = require('fs');
const Configuration = require('../lib/configuration')
const path = require('path')

process.on('message', packet => {
  switch (packet.type) {
    case 'start':
      start(packet.config)
      break
    default:
      console.log(`Recieve: didn't understand message type ${packet.type}`)
  }
})

function start(config) {
  var sourcePort = 20000
  var repairPort = getRepairPort(sourcePort)

  console.log('Started Receive Process')

  driver = process.platform === 'linux'
    ? '-d alsa'
    : ''

  var rocSend = spawn('roc-recv', ['-vv', '-s', `rtp+rs8m::${sourcePort}`, '-r', `rs8m::${repairPort}`, driver]);
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
