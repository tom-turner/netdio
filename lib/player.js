const { exec } = require('child_process');
const EventEmitter = require('events');
const emitter = new EventEmitter();

class Player {

	on( event , callback ){
        emitter.on( event , (message) => {
            callback(message)
        })
    }

	play() {
		console.log('play')
	}
	pause() {
		console.log('pause')
	}
	next() {
		console.log('next')
	}
	last() {
		console.log('last')
	}

	changeTo(service){
		console.log(service)
	}
	
	getCurrentTrack(){
		let artist = ''
		let song = ''
		let artwork = ''
		return {artist: artist, song: song, artwork: artwork}
	}

	start(service){
		console.log("starting", service)
		this.on(`kill-${service}` , (e) => {
			console.log('killing', e)
			process.kill
		})

		if(service == 'spotify') {
			exec(`~/librespot/target/release/librespot -n "Duck" -b 320 --initial-volume 95 --enable-volume-normalisation --normalisation-pregain "-3"`)
		}

		if(service == 'cloud') {
			console.log("starting", service)
		}

		return { service: service, successful : true }
	}

	connect(service){
		console.log("connecting", service)
	}

	kill(service){
		emitter.emit(`kill-${service}`, service)
	}

}

module.exports = Player