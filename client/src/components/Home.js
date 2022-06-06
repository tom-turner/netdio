import { useState, useEffect } from "react";
import { setReceiverSource, setVolume } from '../lib/api'
import { Tx, Rx } from '../lib/devices'
import Loading from './Loading'
import Navbar from './Navbar'
import { Zones, Zone } from './Zones'


let Home = () => {
	let [ selected, setSelected ] = useState({})
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
 
	if(transmitters.length === 0 && receivers.length === 0 )
		return <Loading loadedWhen={transmitters.length !== 0} />

	let handleInputChange = ({ip, value}) => {
		let tx = JSON.parse(value)
		setReceiverSource( ip, tx )
	}

	let handleVolumeChange = ({ip, value}) => {
		setVolume( ip, value )
	}

	let inputOptions = transmitters.map((transmitter, i)=>{
		return <option className="" key={i} value={JSON.stringify(transmitter)}>{transmitter.name}</option>
	})

	let zones = receivers.map((receiver, i) => {
		return <Zone
			key={i}
			receiver={receiver}
			inputOptions={inputOptions}
			handleInputChange={ (e) => { handleInputChange(e)} }
			handleVolumeChange={ (e) => { handleVolumeChange(e)} }
			selected={ selected ? selected.id === receiver.id : false }
			setSelected={ (e) => {
				setSelected( selected.id === receiver.id ? {} : receiver )
			}}
		/>
	})

	return(
			<div className="w-full h-screen text-xl flex flex-col overflow-scroll justify-between">

				<div className="border-b border-neutral-200 pt-12 pb-4 text-neutral-900 text-center font-bold shadow-inner">
					<h2 >Home</h2>
				</div>

				<div className="h-full">
					<Zones className="flex flex-col w-full p-4 pt-8 space-y-4 flex-grow ">
						{zones}
					</Zones >
				</div>

			<Navbar />

			</div>
	)	
}

export default Home;
