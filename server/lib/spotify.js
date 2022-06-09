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
		this.running = false

		setInterval( () => {
			if(!this.running && !this.irrecoverablyErrored)
				this.start()
		}, 5000)
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


	// needs refactor to start network audio transmitters calling for spotify only once its playing
	// but how can we know when its playing?
	start(callback){
		console.log('starting spotify')

		// would be best if this worked with dmix as the device
		this.spotify = exec(`~/librespot/target/release/librespot -n ${config.configObject.spotify.name} --autoplay --enable-volume-normalisation --normalisation-pregain "0" ${backend} ${device} ${format}`)
		
		this.spotify.on('start', (data) => {
			console.log(data)
		})

		this.spotify.stdout.on('data', (data) => {
			console.log('spotify stdout: ' + data.toString())
		})

		this.spotify.stderr.on('data', (data) => {
			console.log('spotify stderr: ' + data.toString())

			let loading = data.match(/Loading(.*?)/)
			if(loading){
				this.running = true
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
			}

			let died = data.match('code: 49')
			if (died) {
				process.kill(this.spotify.pid)
				this.running = false
				console.log({ error : 'spotify ' +this.spotify.pid+ ' closed with code:49' })
				
			}
		})

		this.spotify.on('close', () => {
			this.running = false
			console.log({ error : 'spotify '+this.spotify.pid+' closed' })
		})

	}

}


let spotify = new Spotify()
module.exports = spotify