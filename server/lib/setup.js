
class Setup{
	constructor(config){
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
		this.config.get('tx') 
			? this.config.get('tx')['source'] 
				? console.log( "running tx source", this.config.get('tx')['source'] ) 
				: this.config.set( "tx.source", this.config.getNewPort() )
			: console.log('no tx')

		return this.config.get('tx')
	}


	rx() {
		return this.config.get('rx')
	}


}



module.exports = (config) => {
	return new Setup(config)
}
