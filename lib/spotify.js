const { exec } = require('child_process');
const { getPreview } = require('spotify-url-info')
const fs = require('fs');
const EventEmitter = require('events');
const emitter = new EventEmitter();

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
		this.updateInterval = updateInterval
		this.currentTrack = ''
		this.spotify = exec("~/librespot/target/release/librespot -n test dmix:0,0")
		this.running = false
    this.output = () => {
    	return process.platform == 'linux' ? '--device hw:Loopback,0' : ''
    }
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

	startAndKeepUp(callback){

		if(this.running){
			console.log('keeping spotify alive')
			this.keepAlive()
			return
		}

		this.running = true

		console.log('starting spotify')

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
				callback({ error : 'spotify closed with code:49' })
				
			}
			this.spotify.on('close', () => {
				this.running = false
				callback({ error : 'spotify closed' })
			})
		})

	}

	keepAlive(){
		debounce(()=>{
			process.kill(this.spotify.pid)
			this.running = false
		},this.updateInterval * 2.5)
	}

}
module.exports = Spotify