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

}

module.exports = Player