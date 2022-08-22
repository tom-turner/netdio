let getLog = (input) =>{
	let log = Math.round( Math.log(input) / Math.log(100) * 100 )
	log == -Infinity ? log = 0 : log = log
	return log
}

let getLin = (input) =>{
	let lin = Math.round(Math.pow(100, input / 100))
	input === 0 ? lin = lin -1 : lin = lin
	return lin
}

module.exports.getLin = getLin
module.exports.getLog = getLog