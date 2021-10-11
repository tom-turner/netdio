const { exec } = require('child_process');
const EventEmitter = require('events');
const emitter = new EventEmitter();

class Player {
	constructor(){
		this.childProcesses = []
	}

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
		let artist = 'Artist'
		let song = '123'
		let artwork = 'https://data.whicdn.com/images/13756463/original.jpg'
		return {artist: artist, song: song, artwork: artwork}
	}

	start(service){
		this.killAll()
		if(service == 'spotify') {
			let spotify = exec(`~/librespot/target/release/librespot -n "Duck" -b 320 --initial-volume 95 --enable-volume-normalisation --normalisation-pregain "-3"`)
			this.childProcesses.push(spotify.pid)
		}

		if(service == 'cloud') {
		
		}
		console.log(this.childProcesses)
		return { service: service, successful : true }
	}

	connect(service){
		console.log("connecting", service)
	}

	killAll(){
		for (var child of this.childProcesses){
			this.childProcesses = this.childProcesses.filter((item) => {
				return item !== child
			})
			try { 
				process.kill(child)
				console.log(child, 'killed')
			} catch {
				console.log(child, 'process already dead')
			}
		}
	}
}

module.exports = Player