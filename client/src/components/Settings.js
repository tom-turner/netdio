import { useState, useRef, useContext } from "react";
import { DevicesContext } from '../context/Devices';
import { setName } from '../lib/api'
import { motion } from 'framer-motion'
import { useNavigate, Outlet } from "react-router-dom";
import {ReactComponent as Arrow}  from '../assets/arrow.svg';


let Receiver = ({receiver}) => {
	let [ toggle, setToggle ] = useState(false);

	return (
		<div className="my-auto text-base px-4 py-2 px-4 py-6 flex justify-between">
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
		<div className="my-auto text-base px-4 py-6 flex justify-between">
			<p onClick={ () => { setToggle(!toggle); }} className={`truncate ${ toggle ? 'hidden' : '' }`} >{transmitter.name}</p>
			<input className={`truncate ${ toggle ? '' : 'hidden' }`} type="text" placeholder={transmitter.name} onChange={ e => setName(transmitter.ip, transmitter.type, e.target.value)} />
			<div className="flex space-x-2">
				<button onClick={ () => { setToggle(!toggle);  }} className={`bg-neutral-800 px-4 rounded text-white ${ toggle ? 'hidden' : '' }`}>{ 'Edit'}</button>
				<button onClick={ () => { setToggle(!toggle);  }} className={`bg-neutral-800 px-4 rounded text-white ${ toggle ? '' : 'hidden' }`}>{ 'Save'}</button>
			</div>
		</div>
	)
}


export function EditName() {
	let navigate = useNavigate()
	let { transmitters, receivers } = useContext(DevicesContext)

	let zones = receivers.map((receiver, i) => {
		return (
			<Receiver key={i} receiver={receiver} />
		)
	})

	let sources = transmitters.map((transmitter, i) => {
		return (
			<Transmitter key={i} transmitter={transmitter} />
		)
	})

	return (
		<div className="w-full text-xl flex flex-col overflow-hidden justify-between">

			<div className="border-b border-neutral-200 flex justify-between pt-8 p-4 text-neutral-900 text-center shadow-inner">
				<div className="my-auto w-full">
					<Arrow className="h-6" onClick={ () => { navigate('/settings')} } />
				</div>
				<h2 className="font-bold w-full" >Settings</h2>
				<p className="my-auto text-right w-full" onClick={ () => { navigate('/settings')} } >Done</p>
			</div>
			
			<div className="flex flex-col ">
				<p className="font-bold p-4">Zones</p>
				{zones}

				<p className="font-bold p-4">Sources</p>
				{sources}
			</div>

		</div>
	)

}

export function SettingsList() {
	let navigate = useNavigate()
	return (
		<div className="flex flex-col">
			<ol>
				<li className="px-4 py-4 flex justify-between border-b border-neutral-300" onClick={ () => { navigate('/settings/edit-name')}}> 
					<p className="my-auto">Names</p>
					<Arrow className="rotate-180 my-auto fill-neutral-500" />
				</li>
				<li className="px-4 py-4 flex justify-between border-b border-neutral-300" onClick={ () => { navigate('/settings/groups')}}> 
					<p className="my-auto">Groups</p>
					<Arrow className="rotate-180 my-auto fill-neutral-500" />
				</li>
				<li className="px-4 py-4 flex justify-between border-b border-neutral-300" onClick={ () => { navigate('/settings/eq')}}> 
					<p className="my-auto">EQ</p>
					<Arrow className="rotate-180 my-auto fill-neutral-500" />
				</li>
			</ol>
		</div>
	)
}

export function Settings() {
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

				
				<SettingsList />
				

			</motion.div>
	)	
}

export default Settings;