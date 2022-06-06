const os = require('os')
const path = require('node:path');

let getIp = () => {

	var networkInterfaces = os.networkInterfaces()
	networkInterfaces = Object.entries(networkInterfaces)

	var localInterface = [];

	for (interface of networkInterfaces) {
		for (address of interface[1]) {
			if ( ( address.family == 'IPv4' || address.family == 4 ) && address.internal === false) {

				localInterface.push(address)

			}
		}
	}

	return localInterface[0].address
}

let getHostname = () => {
	return path.parse(os.hostname()).name
}


module.exports.getIp = getIp
module.exports.getHostname = getHostname


