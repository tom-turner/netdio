const { exec } = require('child_process');

class EQ {

	set(param, level) {
		exec(`amixer -D equal -q set ${param} ${level}`)
	}

}

module.exports = EQ