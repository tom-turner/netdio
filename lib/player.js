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
		let artist = 'Vola'
		let song = 'Straight Lines'
		let artwork = 'https://f4.bcbits.com/img/a4138172011_10.jpg'
		return {artist: artist, song: song, artwork: artwork}
	}

}

module.exports = Player