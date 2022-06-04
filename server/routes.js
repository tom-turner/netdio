let express = require('express');
let routes = express.Router();
const config = require('./lib/config')();
const { Tx, Rx, Spotify } = require('./lib/networkServices')
const NetworkAudio = require('./lib/networkAudio')
let audio = new NetworkAudio(config.configObject)
const Processes = require('./lib/processes')
let processes = new Processes()


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
	config.set( 'rx.volume' , req.body.value )
	process.platform === 'linux' ? exec(`amixer -q sset Digital ${req.body.value}%`) : ''
	res.status(200).json({success: true})
});

routes.post('/set-receiver-source', async (req, res) => {
	config.set( 'source' , { name: req.body.name, socket: req.body.socket })
	processes.kill(processes.get('rx'))
    audio.receive(req.body.socket)
	res.status(200).json({success: true})
});

routes.get('/get-audio-stream', async (req, res) => {
	let message = req.body
	console.log(message)
	//config.set( message.type , message.value)
	//roc.rocSend(message.value)
	res.status(200).send()
});

routes.get('/get-devices', async (req, res) => {
	res.json({
		transmitters: Tx.getDeviceList(),
		receivers: Rx.getDeviceList(),
	})
});

routes.get('/get-bonjour-services/tx', async (req, res) => {
	res.json( Tx.getServiceList() )
});

routes.get('/get-bonjour-services/rx', async (req, res) => {
	res.json( Rx.getServiceList() )
});

routes.get('/get-config/tx', async (req, res) => {
	res.json(config.configObject.tx);
});

routes.get('/get-config/rx', async (req, res) => {
	res.json({ ...config.configObject.rx, source: config.configObject.source });
});


module.exports = routes