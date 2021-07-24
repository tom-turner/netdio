const interface = "eth0"

var getIp = require('local-ip');

getIp( interface, function(err, res) {
 	if (err) {
    	console.log(err);
  	}  	
  	return res
});

module.exports = getIp()


