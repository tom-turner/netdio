const Linux = {
	inputDriver() {
		return 'alsa'
	},
	outputDriver() {
		return 'alsa'
	},
	inputDevice() {
		return 'dsnoop:sndrpihifiberry,0'
	},
	outputDevice() {
		return 'adc'
	},
	spotifyDevice() {
		return ''
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
		return 'BlackHole 2ch'
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