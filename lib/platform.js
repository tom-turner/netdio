const Linux = {
	inputDriver() {
		return 'pulseaudio'
	},
	outputDriver() {
		return ''
	},

	inputDevice() {
		return 'alsa_input.platform-soc_sound.stereo-fallback'
	},
	outputDevice() {
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