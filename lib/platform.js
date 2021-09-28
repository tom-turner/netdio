const Linux = {
	driver() {
		return 'pulseaudio'
	},

	inputDevice() {
		return 'snd_rpi_hifiberry_dacplusadc'
	},
	outputDevice() {
		return 'snd_rpi_hifiberry_dacplusadc'
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