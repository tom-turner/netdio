const { exec } = require('child_process');
const { getPreview } = require('spotify-url-info')
const fs = require('fs');
const processes = require('./processes')
const config = require('./config')
let backend = '--backend alsa'
let device ='--device librespot'
let format = '--format S16'

let debounce = (callback, delay) =>{
	let interval;
	return (...args) => {
		clearTimeout(interval)
		interval = setTimeout(() => {
			callback(...args)
			interval = null
		},delay)
	}
}

class Spotify {
	constructor(updateInterval){
		this.config = config
		this.currentTrack = ''
		this.spotify = ''
		this.running = false

		// test current track '3neCnBouNr3Xkbpe7Mzxh4'
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

	start(callback){
		console.log('starting spotify')
		// would be best if this worked with dmix as the device
		this.spotify = exec(`~/librespot/target/release/librespot -n ${config.configObject.spotify.name} --enable-volume-normalisation --normalisation-pregain "0" --backend alsa --device librespot --format S16`)
		
		this.spotify.stdout.on('data', (data) => {
			console.log('stdout: ' + data.toString())
		})

		this.spotify.stderr.on('data', (data) => {
			console.log('stderr: ' + data.toString())

			let match = data.match(/<spotify:track:(.*?)>/)
			if (match) {
				let id = match[1]
				this.currentTrack = id
			}

			let died = data.match('code: 49')
			if (died) {
				process.kill(this.spotify.pid)
				this.running = false
				callback({ error : 'spotify ' +this.spotify.pid+ ' closed with code:49' })
				
			}
			this.spotify.on('close', () => {
				this.running = false
				callback({ error : 'spotify '+this.spotify.pid+' closed' })
			})
		})

	}

}


let spotify = new Spotify()
module.exports = spotify