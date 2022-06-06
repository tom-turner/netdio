import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { setReceiverSource, setVolume } from '../lib/api'
import { Tx, Rx } from '../lib/devices'
import Loading from './Loading'
import { Zones, Zone } from './Zones'
import {ReactComponent as Settings}  from '../assets/settings.svg';
import {ReactComponent as Group}  from '../assets/group.svg';
import {ReactComponent as Edit}  from '../assets/edit.svg';

let Home = () => {
	let [ error, setError] = useState(null)
	let [ transmitters, setTransmitters ] = useState([])
	let [ receivers, setReceivers ] = useState([])
	let [ selected, setSelected ] = useState({})

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

	let inputOptions = transmitters.map((transmitter, i)=>{
		return <option className="" key={i} value={JSON.stringify(transmitter)}>{transmitter.name}</option>
	})

	console.log(selected)

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
			<div className="w-full h-screen text-xl flex flex-col overflow-hidden justify-between">

				<div onClick={ () => { setSelected({}) } } className="border-b border-neutral-200 pt-12 pb-4 text-neutral-900 text-center font-bold shadow-inner">
					<h2 >Home</h2>
				</div>

				<div className="h-full">
					<Zones className="flex flex-col w-full p-4 pt-8 space-y-4 flex-grow ">
						{zones}
					</Zones >
				</div>

				<div className={`flex justify-center pt-4 px-12 pb-12 bg-neutral-900 text-white w-full transition-all duration-250 items-end ${ Object.keys(selected).length !== 0 ? '' : 'translate-y-full'}`}>
					<div className="flex justify-between w-full max-w-md">
						<button className={`font-bold py-2 px-4 `}>
							<Group className="fill-white w-6 h-6" />
						</button>						
						<button className={`font-bold py-2 px-4 `}>
							<Edit className="fill-white w-6 h-6" />
						</button>
					</div>
				</div>

			</div>
	)	
}

export default Home;
