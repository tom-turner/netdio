var os = require('os')
var networkInterfaces = os.networkInterfaces()
networkInterfaces = Object.entries(networkInterfaces)

var localInterface = [];

for (interface of networkInterfaces) {
	for (address of interface[1]) {
		if (address.family == 'IPv4' && address.internal === false) {

			localInterface.push(address)

		}
	}
}

function getIp() {
	return localInterface[0].address
}

function getNetmask() {
	return localInterface[0].netmask
}

function getFamily() {
	return localInterface[0].family
}

console.log("Local IP: ", getIp())

module.exports = getIp()


