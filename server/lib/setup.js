// setup libs
const fs = require('fs')
const config = require('./config')
const platform = require('./platform')
const librespot = require('./spotify')
const { getIp, getHostname } = require('./networkInfo')

// run libs
const audio = require("./networkAudio");
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
	spotify();

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
		config.set('tx.driver', platform.inputDriver() )

	if(!config.get('tx')['device'])
		config.set('tx.device', platform.inputDevice() )

	if(!config.get('tx')['name'])
		config.set('tx.name', `${getHostname()}` )
	
	return config.get('tx')
}

let rx = () => {
	if(!config.get('rx'))
	  return

	config.set('rx.ip', ip() )
	config.set('rx.id', id() )
	config.set('rx.type', 'rx' )

	if(!config.get('rx')['driver'])
		config.set('rx.driver', platform.outputDriver() )

	if(!config.get('rx')['device'])
		config.set('rx.device', platform.outputDevice() )

	if(!config.get('rx')['name'])
		config.set('rx.name', `${getHostname()}` )

	if(!config.get('rx')['socket'])
	  config.set( "rx.socket", config.getNewPort() )
	
	if(!config.get('source')) {
		config.set( "source", {} )
	  	config.set( "source.name", '-Mute-' )
	}
	
	return config.get('rx')
}

let spotify = () => {
	if(!config.get('spotify'))
	  return

	config.set('spotify.ip', ip() )
	config.set('spotify.id', id() )
	config.set('spotify.type', 'spotify' )

	if(!config.get('spotify')['driver'])
		config.set('spotify.driver', platform.inputDriver() )

	if(!config.get('spotify')['device'])
		config.set('spotify.device', platform.spotifyInputDevice() )

	if(!config.get('spotify')['name'])
		config.set('spotify.name', `${getHostname()}-${id().slice(-4)}` )

	if(!config.get('spotify')['socket'])
	  config.set( "spotify.socket", config.getNewPort() )

	return config.get('spotify')
}

let run = () => {

	if(config.configObject.tx)
		Tx.publish()

	if(config.configObject.rx) {
		Rx.publish()
		audio.receive()
	}

	if(config.configObject.spotify)
		Spotify.publish()
		librespot.start()
}

module.exports.setup = setup
module.exports.run = run