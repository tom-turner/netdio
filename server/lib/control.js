
let router = (message, config, devices) => {
	switch (message.type) {
		case 'source':
			roc.kill(roc.get('rx'))
			roc.rocRecv(config.get('source'))
    		//console.log('recv',config.get('source'))
    	break
    	case 'devices' :
    		message.value.send = devices.getDeviceIp(message.value.send)
		    message.value.recv = devices.getDeviceIp(message.value.recv)
		    console.log(message.value.recv)
		    roc.rocSend(message.value)
		   break
    	case 'rx.volume':
    		process.platform === 'linux' ? exec(`amixer -q sset Digital ${message.value}%`) : ''
    	break
    	case 'blink':
    		exec('python ./lib/python/blink.py')
   		 setTimeout( () => {
    		exec('python ./lib/python/ledOn.py')
    	}, 6000 )
    	break
	}
}

module.exports = router
