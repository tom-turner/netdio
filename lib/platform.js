const Linux = {
	driver() {
		return ''
	},

	inputDevice() {
		return ''
	}
}

const Darwin = {
	driver() {
		return ''
	},

	inputDevice() {
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
	}
}