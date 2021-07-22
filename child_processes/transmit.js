const { spawn } = require('child_process');
const fs = require('fs');

var unitConfig = getUnitConfig()
var destPort = Number(unitConfig.destPort).toString()
var repairPort = getRepairPort(destPort)
var rxIp = '192.168.1.150';
var rocSend = spawn('roc-send', ['-vv', '-s', `rtp+rs8m:${rxIp}:${destPort}`, '-r', `rs8m:${rxIp}:${repairPort}`]);


rocSend.stdout.on('data', (data) => {
  console.log('stdout: ', data )
})
rocSend.stderr.on('data', (data) => {
  console.error('ps stderr: ', data );
  // restartProcess(data)
});
rocSend.on('close', (code) => {
  if (code !== 0) {
    console.log('ps process exited with code: ', code );
    rocSend.stdin.end();
    // restartProcess()
  }
});


function getUnitConfig() {
  var file = fs.readFileSync('./config/config.json'), configfile
  return JSON.parse(file);
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