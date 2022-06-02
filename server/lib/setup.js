class Setup{
	constructor(config){
		this.config = config
		this.ip();
		this.id();
		this.tx();
		this.rx();
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

		this.config.set('tx.ip', this.ip() )
		this.config.set('tx.id', this.id() )

		if(!this.config.get('tx')['source'])
			this.config.set( "tx.source", this.config.getNewPort() )

		return this.config.get('tx')
	}

	rx() {
		if(!this.config.get('rx'))
			return

		this.config.set('rx.ip', this.ip() )
		this.config.set('rx.id', this.id() )

		return this.config.get('rx')
	}
}


module.exports = (config) => {
	return new Setup(config)
}
