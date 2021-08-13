function generateNewId() {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  var charactersLength = characters.length;
  for ( var i = 0; i < 8; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * 
       charactersLength));
}
return result;
}

module.exports = generateNewId()