const fs = require('fs')

var date = new Date()

function getDate() {
	var dd = date.getDate().toString()
	var mm = date.getMonth().toString()
	var yyyy = date.getFullYear().toString()
	var dateString = dd+'_'+mm+'_'+yyyy
	return dateString
}

function getTime() {
	var sec = date.getSeconds().toString()
	var min = date.getMinutes().toString()
	var hr = date.getHours().toString()
	var timeString = sec+':'+min+':'+hr
	return timeString
}

class Logs {

	path(){
		var filename = "logfile"
		var path = 'logs/' + filename + '_' + getDate() + '.txt'
		return path
	}

	write(data){
		console.log(data)
		data = getTime() + ": " + data + '\n'
		fs.writeFile(this.path(), data , { flag: 'a+' }, err => {
			if (err) {
				console.log(err)
				return
			}
		})
	}

}

module.exports = Logs