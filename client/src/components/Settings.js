import { useState, useEffect, useRef } from "react";
import { Tx, Rx } from '../lib/devices'
import { setName } from '../lib/api'
import Loading from './Loading'
import Navbar from './Navbar'

let Receiver = ({receiver}) => {
	let [ toggle, setToggle ] = useState(false)
	let nameInput = useRef()
	return (
		<div className="px-4 py-2 flex justify-between rounded border border-neutral-200 shadow-lg">
			<p onClick={ () => { setToggle(!toggle); nameInput.current.focus() }}  className={`truncate ${ toggle ? 'hidden' : '' }`} >{receiver.name}</p>
			<input autoFocus ref={nameInput} className={`truncate ${ toggle ? '' : 'hidden' }`} type="text" placeholder={receiver.name} onChange={ e => setName(receiver.ip, receiver.type, e.target.value)} />
			<div className="flex space-x-2">
				<button className="bg-neutral-800 px-4 rounded text-white">EQ</button>
				<button onClick={ () => { setToggle(!toggle); nameInput.current.focus() }} className={`bg-neutral-800 px-4 rounded text-white `}>{ toggle ? 'Save' : 'Edit'}</button>
			</div>
		</div>
	)
}

let Transmitter = ({transmitter}) => {
	let [ toggle, setToggle ] = useState(false)
	let nameInput = useRef()
	return (
		<div className="px-4 py-2 flex justify-between rounded border border-neutral-200 shadow-lg">
			<p onClick={ () => { setToggle(!toggle); nameInput.current.focus() }} className={`truncate ${ toggle ? 'hidden' : '' }`} >{transmitter.name}</p>
			<input autoFocus ref={nameInput} className={`truncate ${ toggle ? '' : 'hidden' }`} type="text" placeholder={transmitter.name} onChange={ e => setName(transmitter.ip, transmitter.type, e.target.value)} />
			<div className="flex space-x-2">
				<button onClick={ () => { setToggle(!toggle); nameInput.current.focus() }} className={`bg-neutral-800 px-4 rounded text-white `}>{ toggle ? 'Save' : 'Edit'}</button>
			</div>
		</div>
	)
}

let Settings = () => {
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

	let zones = receivers.map((receiver, i) => {
		return <Receiver key={i} receiver={receiver} />
	})

	let inputs = transmitters.map((transmitter, i) => {
		return <Transmitter key={i} transmitter={transmitter} />
	})

	return(
			<div className="w-full h-screen text-xl flex flex-col overflow-hidden justify-between">

				<div className="border-b border-neutral-200 pt-8 pb-4 text-neutral-900 text-center font-bold shadow-inner">
					<h2 >Settings</h2>
				</div>

				<div className="h-full flex flex-col p-4 space-y-4">
					<p className="font-bold">Zones</p>
					{zones}

					<p className="font-bold">Inputs</p>
					{inputs}

					<p className="font-bold">Groups</p>
					{}

				</div>

			<Navbar />

			</div>
	)	
}

export default Settings;
