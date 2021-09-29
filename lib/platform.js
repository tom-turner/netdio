const Linux = {
	driver() {
		return '-d alsa'
	},

	inputDevice() {
		return ''
	},
	outputDevice() {
		return ''
	}
}

const Darwin = {
	driver() {
		return '-d coreaudio'
	},

	inputDevice() {
		return '-i BlackHole'
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