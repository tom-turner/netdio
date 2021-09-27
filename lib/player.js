class Player {

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
		let artist = 'Artist Name'
		let song = 'Song Title'
		let artwork = 'https://f4.bcbits.com/img/a4138172011_10.jpg'
		return {artist: artist, song: song, artwork: artwork}
	}

}

module.exports = Player