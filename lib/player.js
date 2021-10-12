const { exec } = require('child_process');
const { getPreview } = require('spotify-url-info')
const EventEmitter = require('events');
const emitter = new EventEmitter();

class Player {
	constructor(){
		this.childProcesses = []
		this.currentTrack = ''
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

	getCurrentTrack(callback){
		emitter.emit('gettrackinfo', this.currentTrack)
		emitter.on('gettrackinfo', async (id) => {
			try{
				let data = await getPreview('https://open.spotify.com/track/'+id)
				let info = {
					artist: data.artist,
					title: data.title,
					image: data.image,
				}
				callback(info)
			} catch {
				console.log('no track info')
			}
		})
	}

	start(service){
		if(service == 'spotify') {	

			let spotify = exec('~/librespot/target/release/librespot -n Duck -b 320 --onevent "./test.sh" --initial-volume 95 --enable-volume-normalisation --normalisation-pregain -3')

			spotify.stdout.on('data', (data) => {
				console.log('stdout: ' + data.toString())
				//this.currentTrack = ''
				//emitter.emit('gettrackinfo', this.currentTrack)
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
			spotify.on('librespot_playback::player', (data) => {
				console.log(data)
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