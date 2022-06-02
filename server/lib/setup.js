const config = require('./config')();

class Setup{
	constructor(){
		this.config = config;
		this.ip = this.ip();
		this.id = this.id();
		this.tx = this.tx();
		this.rx = this.rx();
	}

	ip(){
		this.config.set("device.ip", require('./getIp')() )
		return this.config.get('device')['ip']
	}

	id(){
		this.config.set("device.id", this.config.hash(this.ip))
		return this.config.get('device')['id']
	}

	tx() {
		if(!this.config.get('tx'))
			return

		if(!this.config.get('tx')['source'] )
			this.config.set( "tx.source", this.config.getNewPort() )

		this.config.set('tx.ip', this.ip )
		this.config.set('tx.id', this.id )

		return this.config.get('tx')
	}

	rx() {
		if(!this.config.get('rx'))
			return

		this.config.set('rx.ip', this.ip )
		this.config.set('rx.id', this.id )

		return this.config.get('rx')
	}
}



module.exports = () => {
	return new Setup()
}
