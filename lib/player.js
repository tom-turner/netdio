const { exec } = require('child_process');
const { getPreview } = require('spotify-url-info')
const EventEmitter = require('events');
const emitter = new EventEmitter();

class Player {
	constructor(){
		this.childProcesses = []
		this.currentTrack = ''
		// '3neCnBouNr3Xkbpe7Mzxh4'
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
			let number = Math.random().toString().slice(-6)
			let spotify = exec(`~/librespot/target/release/librespot -n Duck-${number} -b 160 --initial-volume 95 --enable-volume-normalisation --normalisation-pregain -3 --device 'hw:Loopback,0'`)

			spotify.stdout.on('data', (data) => {
				console.log('stdout: ' + data.toString())
			})
			spotify.stderr.on('data', (data) => {
				console.log('stderr: ' + data.toString())
				let match = data.match(/<spotify:track:(.*?)>/)
				if (match) {
					let id = match[1]
					this.currentTrack = id
					emitter.emit('gettrackinfo', this.currentTrack)
				}
				
			})
			spotify.on('close', (data) => {
				this.currentTrack = ''
				console.log(data)
			})
			spotify.on('error', (err) => {
				console.log(err)
			})
			this.childProcesses.push(spotify.pid)
		}	
		return { service: service, successful : true, pid: this.childProcesses[0] }
	}

	kill(pid){
		this.childProcesses.push(pid)
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