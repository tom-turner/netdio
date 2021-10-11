const Linux = {
	inputDriver() {
		return 'alsa'
	},
	outputDriver() {
		return 'alsa'
	},

	inputDevice() {
		return 'player' ? 'hw:Loopback,1' : 'hw:sndrpihifiberry,0'
	},
	outputDevice() {
		return 'hw:1,0'
	}
}

const Darwin = {
	inputDriver() {
		return 'coreaudio'
	},
	outputDriver() {
		return 'coreaudio'
	},

	inputDevice() {
		return 'BlackHole'
	},
	outputDevice() {
		return ''
	}
}

const platforms = {
	linux: Linux,
	darwin: Darwin
}

module.exports = {
	platform() {
		return process.platform
	},

	inputDriver() {
		return platforms[this.platform()].inputDriver()
	},
	outputDriver() {
		return platforms[this.platform()].outputDriver()
	},

	inputDevice(){
		return platforms[this.platform()].inputDevice()
	},

	outputDevice(){
		return platforms[this.platform()].outputDevice()
	}
}