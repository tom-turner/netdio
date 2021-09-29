const Linux = {
	inputDriver() {
		return 'protocol-native.c'
	},
	outputDriver() {
		return 'protocol-native.c'
	},

	inputDevice() {
		return ''
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