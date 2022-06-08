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
	spotifyInputDevice() {
		return 'dsnoop:Loopback,1'
	},
	spotifyOutputDevice() {
		return 'librespot'
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
	},
	spotifyInputDevice() {
		return ''
	},
	spotifyOutputDevice() {
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
	},

	spotifyInputDevice(){
		return platforms[this.platform()].spotifyInputDevice()
	},

	spotifyOutputDevice(){
		return platforms[this.platform()].spotifyOutputDevice()
	}
}