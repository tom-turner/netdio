let express = require('express');
let routes = express.Router();
const fs = require('fs')
const { exec } = require('child_process');
const config = require('./lib/config')
const eq = require('./lib/eq')
const { Tx, Rx, Spotify } = require('./lib/networkServices')
const audio = require('./lib/networkAudio')
const processes = require('./lib/processes')


routes.post('/reset', () => {
	fs.unlinkSync('config/config.json')
	return process.exit()
})

routes.post('/reset-spotify', () => {
	return exec('sudo reboot')
})

routes.post('/reboot', () => {
	return exec('sudo reboot')
});

routes.post('/blink', async (req, res) => {
	exec('python ./lib/python/blink.py')
	setTimeout( () => {
		exec('python ./lib/python/ledOn.py')
	}, 6000 )
	res.status(200).send()
});

routes.post('/set-name', async (req, res) => {
	config.set( `${req.body.type}.name` , req.body.value )
	res.status(200).json({success: true})
});

routes.post('/set-volume', async (req, res) => {
	config.set( 'rx.volume' , req.body.value )
	process.platform === 'linux' ? exec(`amixer -q sset Digital ${req.body.value}%`) : ''
	res.status(200).json({success: true})
});

routes.post('/set-group', async (req, res) => {
	config.set( 'group' , req.body.value )
	res.status(200).json({success: true})
});

routes.post('/set-receiver-source', async (req, res) => {
	config.set( 'source' , req.body)
	processes.kill(processes.get('rx'))
    audio.receive(req.body.socket)
	res.status(200).json({success: true})
});

routes.post('/audio-stream', async (req, res) => {
	audio.transmit(req.body)
	res.status(200).json({success: true})
});

routes.post('/set-eq', (req,res) => {
    eq.set(req.body.param, req.body.value)
 	res.json({successful: true})
})

routes.post('/set-eq-flat', (req,res) => {
    eq.flat() 
  	res.json({successful: true})
})

routes.get('/get-eq', async (req, res) => {
	return eq.get(	(e) => {
		if(e.error)
			return res.json({error: e.error})

		res.json(e);
	})
});

routes.get('/get-bonjour-services/tx', async (req, res) => {
	res.json( Tx.getServiceList() )
});

routes.get('/get-bonjour-services/rx', async (req, res) => {
	res.json( Rx.getServiceList() )
});

routes.get('/get-bonjour-services/spotify', async (req, res) => {
	res.json( Spotify.getServiceList() )
});

routes.get('/get-config/tx', async (req, res) => {
	res.json(config.configObject.tx);
});

routes.get('/get-config/rx', async (req, res) => {
	res.json({ ...config.configObject.rx, source: config.configObject.source, group: config.configObject.group });
});

routes.get('/get-config/spotify', async (req, res) => {
	res.json(config.configObject.spotify);
});

routes.get('/get-config', async (req, res) => {
	res.json(config.configObject);
});

module.exports = routes
