const interface = process.platform === 'linux' ? 'eth0' || 'wlan0' : 'en0'

console.log("using", interface)

var getIp = require('local-ip');

getIp( interface, function(err, res) {
 	if (err) {
    	console.log(err);
  	}  	
  	return res
});

module.exports = getIp()


