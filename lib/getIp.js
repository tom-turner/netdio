const interface = "en0"

var getIp = require('local-ip');

getIp( interface, function(err, res) {
 	if (err) {
    	throw new Error('err');
  	}  	
  	return res
});

module.exports = getIp()


