const Linux = {
	driver() {
		return 'pulseaudio'
	},

	inputDevice() {
		return 'alsa_input.platform-soc_sound.stereo-fallback'
	},
	outputDevice() {
		return 'alsa_output.platform-soc_sound.stereo-fallback'
	}
}

const Darwin = {
	driver() {
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

	driver() {
		return platforms[this.platform()].driver()
	},

	inputDevice(){
		return platforms[this.platform()].inputDevice()
	},

	outputDevice(){
		return platforms[this.platform()].outputDevice()
	}
}