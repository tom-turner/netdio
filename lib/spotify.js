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
	constructor(config, updateInterval){
		this.updateInterval = updateInterval
		this.config = config
		this.currentTrack = ''
		this.childProcesses = []
    this.file = "config/playerprocesses.json"
    this.started = false
		// test current track '3neCnBouNr3Xkbpe7Mzxh4'
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
      if (err) { console.log(err) } 
    }
  }

  get(value){
    return this.childProcesses.filter((item) => {
      if (value) {
        return item.type == value || item.pid == value || item.ip == value
      } else return true
    })
  }

  kill(){
  	let array = this.childProcesses
  	for ( var obj of array) {
  		this.childProcesses = this.childProcesses.filter((item) => {
  			return item !== this.get(obj.pid)[0]
  		})
  		try { 
  			process.kill(obj.pid)
  			console.log(obj.pid, 'player killed')
  		} catch {
  			console.log(obj.pid, 'player process already dead')
  		}
  	}
  }

	on( event , callback ){
        emitter.on( event , (message) => {
            callback(message)
        })
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

	startAndKeepAlive(){

			if(this.get('player').toString()){
      	this.keepAlive('player')
      	return
    	}

			let spotify = exec(`~/librespot/target/release/librespot -n Duck-${this.config.device.name} -b 160 --initial-volume 95 --enable-volume-normalisation --normalisation-pregain -3 --device 'hw:Loopback,0'`)

			this.timeout((dead)=>{
      	dead ? this.kill(this.get(spotify.pid)) : ''
    	}, 'player') 

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
		return ({ service: service, successful : true })
	}

	timeout(callback, player) {
    let timer = this.updateInterval * 2.5

    emitter.on(player, () => {
      timer = this.updateInterval * 2.5
    })

    var timeout = setInterval( () => {

      timer = timer - this.updateInterval
      if(timer <= 0) {
        callback(true)
        clearInterval(timeout)
        } else {
        	console.log(timer)
          callback(false);
        }

    },this.updateInterval)
  }
  
  keepAlive(player){
    emitter.emit(player)
  }

}

module.exports = Spotify