const { exec } = require('child_process');
const { getPreview } = require('spotify-url-info')
const fs = require('fs');
const processes = require('./processes')
const config = require('./config')
const platform = require('./platform')
let backend = `--backend ${platform.outputDriver()}`
let device =`--device ${platform.spotifyOutputDevice()}`
let format = '--format S16'

class Spotify {
	constructor(updateInterval){
		this.config = config
		this.currentTrack = ''
		this.spotify = ''
		this.started = false 
		this.running = false // gets pulled into to networkAudio to prevent transmit before running
	}

	async getCurrentTrack(callback){
		if(this.currentTrack){
				let data = await getPreview('https://open.spotify.com/track/'+this.currentTrack)
				let info = {
					artist: data.artist,
					title: data.title,
					image: data.image,
				}
				return info
		}
	}

	keepAlive(){
		setInterval( () => {
			if(!this.started)
				this.start()
		}, 5000)
	}

	// needs refactor to start network audio transmitters calling for spotify only once its playing
	// but how can we know when its playing?
	start(callback){
		console.log('starting spotify')
		this.keepAlive()
		// would be best if this worked with dmix as the device
		this.spotify = exec(`~/librespot/target/release/librespot -n ${config.configObject.spotify.name} --autoplay --enable-volume-normalisation --normalisation-pregain "0" ${backend} ${device} ${format}`)
		
		this.started = true

		this.spotify.stdout.on('data', (data) => {
			console.log('spotify stdout: ' + data.toString())
		})

		this.spotify.stderr.on('data', (data) => {
			console.log('spotify stderr: ' + data.toString())

			let loading = data.match(/Loading(.*?)/)
			if(loading){
				setTimeout( () => {
					this.running = true
				}, 1000)
			}

			let track = data.match(/<spotify:track:(.*?)>/)
			if (track) {
				let id = track[1]
				this.currentTrack = id
			}

			let invalid = data.match(/Invalid(.*?)/)
			if(invalid) {
				process.kill(this.spotify.pid)
				this.running = false
				this.started = false
			}

			let keyError = data.match(/KeyError(.*?)/)
			if(keyError) {
				process.kill(this.spotify.pid)
				this.running = false
				this.started = false
			}


			let died = data.match('code: 49')
			if (died) {
				process.kill(this.spotify.pid)
				this.running = false
				this.started = false
				console.log({ error : 'spotify ' +this.spotify.pid+ ' closed with code:49' })
				
			}
		})

		this.spotify.on('close', () => {
			this.running = false
			this.started = false
			process.kill(this.spotify.pid)
			console.log({ error : 'spotify '+this.spotify.pid+' closed' })
		})

	}

}


let spotify = new Spotify()
module.exports = spotify