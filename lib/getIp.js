var os = require('os')
var networkInterfaces = os.networkInterfaces()
networkInterfaces = Object.entries(networkInterfaces)

var localInterface = [];

for (interface of networkInterfaces) {
	for (address of interface[1]) {
		console.log(address)
		if (address.family == 'IPv4' && address.internal === false) {

			localInterface.push(address)

		}
	}
}

function getIp() {
	console.log(localInterface)
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


