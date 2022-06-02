let express = require('express');
let routes = express.Router();
const config = require('./lib/config')();
const { Network, Spotify } = require('./lib/networkServices')
const Roc = require('./lib/roc')
let roc = new Roc(config.configObject)


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
	process.platform === 'linux' ? exec(`amixer -q sset Digital ${message.value}%`) : ''
	res.status(200).send()
});

routes.post('/set-audio-source', async (req, res) => {
	let message = req.body
	config.set( message.type , message.value)
	roc.kill(roc.get('rx'))
    roc.rocRecv(config.get('source'))
	res.status(200).send()
});

routes.get('/get-audio-stream', async (req, res) => {
	let message = req.body
	config.set( message.type , message.value)
	roc.rocSend(message.value)
	res.status(200).send()
});

routes.get('/get-network-device-list', async (req, res) => {
	res.json( Network.getDeviceList() )
});

routes.get('/get-config', async (req, res) => {
	res.json(config.configObject);
});


module.exports = routes