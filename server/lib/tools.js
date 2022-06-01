
class Tools {

	generateNewId(input) {
		!input ? input = 8 : input = input
		let result           = '';
		let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
		let charactersLength = characters.length;
		for ( var i = 0; i < input; i++ ) {
			result += characters.charAt(Math.floor(Math.random() * 
				charactersLength));
		}
		return result;
	}

}

module.exports = Tools