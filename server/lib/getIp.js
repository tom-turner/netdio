var os = require('os')

function getIp() {

	var networkInterfaces = os.networkInterfaces()
	networkInterfaces = Object.entries(networkInterfaces)

	var localInterface = [];

	for (interface of networkInterfaces) {
		for (address of interface[1]) {
			console.log(address)
			if (address.family ==  'IPv4' || 4  && address.internal === false) {

				localInterface.push(address)

			}
		}
	}

	return localInterface[0].address
}

function getNetmask() {
	return localInterface[0].netmask
}

function getFamily() {
	return localInterface[0].family
}


module.exports = getIp


