// setup libs
const fs = require('fs')
const config = require('./config')
const { getIp, getHostname } = require('./networkInfo')

// run libs
const audio = require("./NetworkAudio");
const { Tx, Rx, Spotify } = require('./networkServices')

let setup = () => {
	// copy example.env to .env on first run
	if(!fs.existsSync('.env'))
	  fs.writeFileSync('.env', fs.readFileSync('.example.env'), (err) => {
	    console.log(err)
	  })

	// copy server.env to client to share ports/keys with client
	// .env variables need REACT_APP_ formatting for security on client side
	fs.writeFileSync('client/.env', fs.readFileSync('.env'), (err) => {
	    console.log(err)
	  })

	tx();
	rx();

	return
}

let ip = () => {
	if(!config.get('device'))
		config.set('device', {} )

	config.set("device.ip", getIp() )
	return config.get('device')['ip']
}

let id = () => {
	if(!config.get('device'))
		config.set('device', {} )

	config.set("device.id", config.hash(ip()))
	return config.get('device')['id']
}


let tx = () => {
	if(!config.get('tx'))
	  return

	config.set('tx.ip', ip() )
	config.set('tx.id', id() )
	config.set('tx.type', 'tx' )

	if(!config.get('tx')['driver'])
		config.set('tx.driver', '' )

	if(!config.get('tx')['hardware'])
		config.set('tx.hardware', '' )

	if(!config.get('tx')['name'])
		config.set('tx.name', `${getHostname()}` )
	

	if(!config.get('tx')['socket'])
	  config.set( "tx.socket", config.getNewPort() )

	return config.get('tx')
}

let rx = () => {
	if(!config.get('rx'))
	  return

	config.set('rx.ip', ip() )
	config.set('rx.id', id() )
	config.set('rx.type', 'rx' )

	if(!config.get('rx')['driver'])
		config.set('rx.driver', '' )

	if(!config.get('rx')['hardware'])
		config.set('rx.hardware', '' )

	if(!config.get('rx')['name'])
		config.set('rx.name', `${getHostname()}` )
	
	if(!config.get('source'))
		config.set( "source", {} )
	  	config.set( "source.name", '-Mute-' )

	return config.get('rx')
}

let run = () => {

	if(config.configObject.tx)
		Tx.publish()

	if(config.configObject.rx) {
		Rx.publish()
		audio.receive(config.configObject.source.socket)
	}


}

module.exports.setup = setup
module.exports.run = run