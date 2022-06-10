const { exec } = require('child_process');


let set = (param, level) => {
	exec(`amixer -D equal -q set ${JSON.stringify(param)} ${level}`, (res) => {
			console.log(res) 
	})
}

let get = (callback) => {
	exec(`amixer -D equal`,  (err,stdout,stderr) => {
		if(err) { return callback({ error: true }) }
		return callback(format(stdout))
	})		
}

let format = (str) =>{
	let keys = str.match(/(?<=\l ')(.*?)(?=\')/g)
	let arr = []

	keys.forEach( (key, i) => {
		let obj = {
			param : key,
			level : str.match(/(?<=\Playback)(.*?)(?=\[)/g)[i*2].replace(/\s/g, '')
		}
		arr.push(obj)
	})

	return arr
}

let flat = () => {
	this.set('00. 31 Hz', 66)
	this.set('01. 63 Hz', 66)
	this.set('02. 125 Hz', 66)
	this.set('03. 250 Hz', 66)
	this.set('04. 500 Hz', 66)
	this.set('05. 1 kHz', 66)
	this.set('06. 2 kHz', 66)
	this.set('07. 4 kHz', 66)
	this.set('08. 8 kHz', 66)
	this.set('09. 16 kHz', 66)
}


module.exports.get = get
module.exports.set = set
module.exports.flat = flat