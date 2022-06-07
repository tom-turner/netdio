import { useState, useRef, useContext } from "react";
import { DevicesContext } from '../context/Devices';
import { setName } from '../lib/api'
import { motion } from 'framer-motion'

let Receiver = ({receiver}) => {
	let [ toggle, setToggle ] = useState(false);

	return (
		<div className="my-auto text-base px-4 py-2 flex justify-between rounded border border-neutral-200 shadow-lg">
			<p onClick={ () => { setToggle(!toggle); }}  className={`truncate ${ toggle ? 'hidden' : '' }`} >{receiver.name}</p>
			<input className={`truncate ${ toggle ? '' : 'hidden' }`} type="text" placeholder={receiver.name} onChange={ e => setName(receiver.ip, receiver.type, e.target.value)} />
			<div className="flex space-x-2">
				<button onClick={ () => { setToggle(!toggle);  }} className={`bg-neutral-800 px-4 rounded text-white ${ toggle ? 'hidden' : '' }`}>{ 'Edit'}</button>
				<button onClick={ () => { setToggle(!toggle);  }} className={`bg-neutral-800 px-4 rounded text-white ${ toggle ? '' : 'hidden' }`}>{ 'Save'}</button>
			</div>
		</div>
	)
}

let Transmitter = ({transmitter}) => {
	let [ toggle, setToggle ] = useState(false)

	return (
		<div className="my-auto text-base px-4 py-2 flex justify-between rounded border border-neutral-200 shadow-lg">
			<p onClick={ () => { setToggle(!toggle); }} className={`truncate ${ toggle ? 'hidden' : '' }`} >{transmitter.name}</p>
			<input className={`truncate ${ toggle ? '' : 'hidden' }`} type="text" placeholder={transmitter.name} onChange={ e => setName(transmitter.ip, transmitter.type, e.target.value)} />
			<div className="flex space-x-2">
				<button onClick={ () => { setToggle(!toggle);  }} className={`bg-neutral-800 px-4 rounded text-white ${ toggle ? 'hidden' : '' }`}>{ 'Edit'}</button>
				<button onClick={ () => { setToggle(!toggle);  }} className={`bg-neutral-800 px-4 rounded text-white ${ toggle ? '' : 'hidden' }`}>{ 'Save'}</button>
			</div>
		</div>
	)
}

let Settings = () => {
	let { transmitters, receivers } = useContext(DevicesContext)
 
	let zones = receivers.map((receiver, i) => {
		return <Receiver key={i} receiver={receiver} />
	})

	let sources = transmitters.map((transmitter, i) => {
		return <Transmitter key={i} transmitter={transmitter} />
	})

	return(
			<motion.div 
				className="w-full text-xl flex flex-col overflow-hidden justify-between"
				key={'settings'}
				initial={{opacity: 0}}
				animate={{opacity: 1}}
				exit={{opacity: 0}}
				transition={{ delay: 0, duration:0.3, ease: "easeInOut" }}
			>

				<div className="border-b border-neutral-200 pt-8 pb-4 text-neutral-900 text-center font-bold shadow-inner">
					<h2 >Settings</h2>
				</div>

				<div className="h-full flex flex-col p-4 space-y-2">

					<p className="font-bold">Zones</p>
					{zones}

					<p className="font-bold pt-4">Sources</p>
					{sources}
					
					<div className="flex pt-8 justify-between">
						<p className="font-bold">Groups</p>
						<button className="bg-neutral-800 px-4 text-base rounded text-white">Add</button>
					</div>
					{}
					

				</div>

			</motion.div>
	)	
}

export default Settings;
