const fs = require('fs')

class Logs {

	path(){
		var filename = "log-file"
		// add increments
		var path = `logs/${filename}.txt`

		return path
	}

	write(data){

		data = data + '\n'

		fs.writeFile(this.path(), data , { flag: 'a+' }, err => {
			if (err) {
				console.log(err)
				return
			}
		})
	}

}

module.exports = Logs