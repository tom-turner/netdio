const fs = require('fs')
let path = './config/'

fs.readdirSync(path).forEach(file => {
	let stat = fs.statSync(path + file)
	console.log(stat.size)
	if(stat.size <= 1) {
		fs.unlink(path + file, err => {
			if (err) {
				console.log(err)
			}
		})
	}
})
