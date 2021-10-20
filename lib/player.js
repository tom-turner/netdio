const { exec } = require('child_process');
const { getPreview } = require('spotify-url-info')
const fs = require('fs');
const EventEmitter = require('events');
const emitter = new EventEmitter();

class Player {
	constructor(config){
		this.config = config
		this.currentTrack = ''
		this.childProcesses = []
    	this.file = "config/playerprocesses.json"
		// current track '3neCnBouNr3Xkbpe7Mzxh4'
	}

  savedProcesses(){
    if(!fs.existsSync(this.file)) {
      fs.writeFileSync(this.file, '[]')
    }
    return JSON.parse(fs.readFileSync(this.file))
  }

  depreciated() {
      let depreciated = this.savedProcesses().filter( (obj) =>{
      let compare = this.get(obj.pid)[0] ? this.get(obj.pid)[0] : '';
        return obj.pid !== compare.pid
      })
      return depreciated
  }

  update(data){
    this.kill(this.depreciated())
    this.childProcesses.push(data)

    fs.writeFileSync( this.file , JSON.stringify(this.childProcesses)), (err) => {
      if (err) { "err", console.log(err) } 
    }
  }

  get(value){
    return this.childProcesses.filter((item) => {
      if (value) {
        return item.type == value || item.pid == value || item.ip == value
      } else return true
    })
  }

  kill(array){
  	console.log(this.childProcesses)
  	for ( var obj of array) {
  		this.childProcesses = this.childProcesses.filter((item) => {
  			return item !== this.get(obj.pid)[0]
  		})
  		try { 
  			process.kill(obj.pid)
  			console.log(obj.pid, 'killed')
  		} catch {
  			console.log(obj.pid, 'process already dead')
  		}
  	}
  }

	on( event , callback ){
        emitter.on( event , (message) => {
            callback(message)
        })
    }

	play() {
		console.log('play')
		emitter.emit('gettrackinfo', this.currentTrack)
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
		this.kill(this.get('player'))
		if(service == 'spotify') {
			let spotify = exec(`~/librespot/target/release/librespot -n Duck-${this.config.device.name} -b 160 --initial-volume 95 --enable-volume-normalisation --normalisation-pregain -3 --device 'dmix:Loopback,0'`)

			this.update({
      			type : "player",
      			pid : spotify.pid
    		})

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
				this.kill(this.get(spotify.pid))
				console.log(data)
			})
			spotify.on('error', (err) => {
				this.kill(this.get(spotify.pid))
				console.log(err)
			})
		}	
		return { service: service, successful : true }
	}

}

module.exports = Player