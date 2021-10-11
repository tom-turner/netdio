const { exec } = require('child_process');
const EventEmitter = require('events');
const emitter = new EventEmitter();

const args = [
	'',
	'',
	'',
	'',
	''
]
const options = {
	cwd : ""
}

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

	getCurrentTrack(){
		let artist = 'Artist'
		let song = ''
		let artwork = 'https://data.whicdn.com/images/13756463/original.jpg'
		return {artist: artist, song: song, artwork: artwork}
	}

	start(service){
		if(service == 'spotify') {	

			let spotify = exec('~/librespot/target/release/librespot -n Duck -b 320 --initial-volume 95 --enable-volume-normalisation --normalisation-pregain -3', (error, stdout, stderr) => {
				if (error) {
					console.log(error)
				}
				console.log(stdout);
				console.log(stderr);
			})

			spotify.stdout.on('data', (data) => {
				console.log('stdout: ' + data.toString())
			})
			spotify.stderr.on('data', (data) => {
				console.log('stderr: ' + data.toString())
			})
			spotify.on('close', (data) => {
				console.log(data)
			})
			spotify.on('error', (err) => {
				console.log(err)
			})

			this.childProcesses.push(spotify.pid)
		}
		if(service == 'cloud') {
		}

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