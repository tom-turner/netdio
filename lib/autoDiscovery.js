
const net = require('net'),
    JsonSocket = require('json-socket');
const find = require('local-devices');

var port = 20000


function getDeviceIps(callback) {
	find().then(devices => {

		for ( var device of devices ) {
		
			callback(device)

		}
	})
}



class Devices {
	constructor(config) {
		this.config = config
	}

	pingDevices(callback) {

		getDeviceIps( (device) => {
			new Promise((resolve, reject) => {

    			let client = new JsonSocket(new net.Socket())

                client.connect(port, device.ip);
                client.on('connect', () => {
                    client.sendMessage(this.config);
                    client.on('message', (message) => {
                        callback(message)

                    })
    			 });
    			 
                client.on('error', err => reject(err) );


    		}).then( connection => { // handles errors
    				connection.on('data', data => {
        				// Do stuff with the data
        			})
    		}, error => {})
		})
	}

    startListening(callback) {
        var server = new net.createServer();
        server.listen(port);
        server.on('connection', (socket) => {
            socket = new JsonSocket(socket);

            socket.on('message', (message) => {
                callback(message)
                socket.sendMessage(this.config)
            })
            socket.on('end', () => {
                console.log("connection ended")
                // log client disconnection
            })
            
        })
    }






	
}

module.exports = Devices

