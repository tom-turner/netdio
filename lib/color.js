class Color {

	darken(color) {

		return '#' + color.replace(/^#/, '').replace(/../g, color => ('0'+Math.min(255, Math.max(0, parseInt(color, 16) + -60)).toString(16)).substr(-2));
	}

}

module.exports = Color