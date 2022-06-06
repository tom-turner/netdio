import { useState, useEffect } from "react";
import { setReceiverSource, setVolume } from '../lib/api'
import { Tx, Rx } from '../lib/devices'
import Loading from './Loading'
import { Zones, Zone } from './Zones'

let Home = () => {
	let [ error, setError] = useState(null)
	let [ transmitters, setTransmitters ] = useState([])
	let [ receivers, setReceivers ] = useState([])

	useEffect(() => {
		Tx.subscribe(({ devices, error }) =>{
			setTransmitters(devices)
		})
		Rx.subscribe(({ devices, error }) =>{
			setReceivers(devices)
		})
	}, []);
 
	if(transmitters.length == 0 && receivers.length == 0 )
		return <Loading loadedWhen={transmitters.length !== 0} />


	let handleInputChange = ({ip, value}) => {
		let tx = JSON.parse(value)
		setReceiverSource( ip, tx )
	}

	let handleVolumeChange = ({ip, value}) => {
		setVolume( ip, value )
	}

	let zones = receivers.map((receiver, i) => {
		return <Zone
			key={i}
			receiver={receiver}
			transmitters={transmitters}
			handleInputChange={ (e) => { handleInputChange(e)} }
			handleVolumeChange={ (e) => { handleVolumeChange(e)} }
		/>
	})

	return(
			<div className="w-full h-screen text-xl flex flex-col overflow-hidden" >

				<div className="border-b border-zinc-300 pt-12 pb-4 text-zinc-800 text-center font-bold shadow-inner">
					<h2 >Home</h2>
				</div>

				<Zones className="flex flex-col w-full p-4 pt-8 space-y-4 ">
					{zones}
				</Zones >
			</div>
	)	
}

export default Home;
