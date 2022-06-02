let express = require('express');
let routes = express.Router();
const config = require('./lib/config')();
const { Tx, Rx, Spotify } = require('./lib/networkServices')
//const Roc = require('./lib/roc')
//let roc = new Roc(config.configObject)


routes.post('/reset', () => {
	fs.copyFile('public/images/duckado-logo.jpg', 'public/images/logo', (err) => {
		if (err) { console.log('error resetting logo file:', err)}
	})
	fs.unlinkSync('config/config.json')
	setTimeout( () => { exec('sudo reboot') },250)
})

routes.post('/reboot', () => {
	console.log('rebooting')
	exec('sudo reboot')
});

routes.post('/blink', async (req, res) => {
	exec('python ./lib/python/blink.py')
	setTimeout( () => {
		exec('python ./lib/python/ledOn.py')
	}, 6000 )
	res.status(200).send()
});

routes.post('/set-volume', async (req, res) => {
	config.set( message.type , message.value)
	process.platform === 'linux' ? exec(`amixer -q sset Digital ${message.value}%`) : ''
	res.status(200).send()
});

routes.post('/set-audio-source', async (req, res) => {
	let message = req.body
	config.set( message.type , message.value)
	//roc.kill(roc.get('rx'))
    //roc.rocRecv(config.get('source'))
	res.status(200).send()
});

routes.post('/set-audio-stream', async (req, res) => {
	let message = req.body
	config.set( message.type , message.value)
	//roc.rocSend(message.value)
	res.status(200).send()
});

routes.get('/get-list-of-transmitters', async (req, res) => {
	res.json( Tx.getDeviceList() )
});

routes.get('/get-list-of-receivers', async (req, res) => {
	res.json( Rx.getDeviceList() )
});

routes.get('/get-config/tx', async (req, res) => {
	res.json(config.configObject.tx);
});

routes.get('/get-config/rx', async (req, res) => {
	res.json({ ...config.configObject.rx, source: config.configObject.source });
});


module.exports = routes