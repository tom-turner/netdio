import { useState, useContext } from "react";
import { setReceiverSource, setVolume } from '../lib/api'
import { DevicesContext } from '../context/Devices'
import { Header} from './Header'
import { motion } from 'framer-motion'
import {ReactComponent as LoadingMeters}  from '../assets/loadingMeters.svg';
import {ReactComponent as Muted}  from '../assets/muted.svg';


let Zone = ({ receiver, inputOptions, handleInputChange, handleVolumeChange, selected, setSelected }) => {
	let muted = receiver.source.socket ? false : true

	return(
		<div className={`w-full bg-white ${ selected ? 'border-neutral-500 border shadow-md' : 'border-b border-neutral-300' }`} >
		 	
			<div className="flex justify-between w-full space-x-4 px-4 pt-4" onClick={ () => { setSelected(  selected ? {} : receiver)  }}>
		 		<div className="flex w-full" >
		 			<p  className={`font-bold my-auto text-neutral-800 w-full flex grow truncate `}> {receiver.name} </p>
		 			<LoadingMeters className={`h-6 fill-s-800 ${ muted || selected ? 'hidden' : ''}`} />
		 			<Muted className={`h-6 fill-s-800 ${ muted ? '' : 'hidden'} ${ selected ? 'hidden' : ''}`} />
		 		</div>
		 		<div className={`text-right w-full ${ selected ? '' : 'hidden'}`}>
		 			<p className={`text-base my-auto text-neutral-800 truncate`}>{ ` Source: ${receiver.source.name} `}</p>
		 		</div>
		 	</div>
		 	<div className="px-4 pb-4">
		 		<input defaultValue={receiver.volume} type="range" className={`w-full`} onChange={ (e) => { handleVolumeChange({ ip: receiver.ip, value: e.target.value }) }} />
		 	</div>
		</div>
	)	
}

let Selector = ({selected, handleInputChange, setSelected, inputOptions}) => {
	if(Object.values(selected).length === 0)
		return 

	return (
		<motion.div
			className="bg-neutral-900 w-full p-8 flex justify-center"
			initial={{opacity: 0}}
			animate={{opacity: 1}}
			exit={{opacity: 0}}
			transition={{ delay: 0, duration:0.3 }}
		> 
			<select autoFocus onBlur={ () => { setSelected({}) } } className="text-right max-w-2xl text-base my-auto text-neutral-800 w-full p-4 rounded" onChange={ (e) => { handleInputChange({ ip: selected.ip , value: e.target.value }); setSelected({}) } } defaultValue={'default'} >
				<option className="" disabled value={'default'} >{selected.source.name}</option>
				<option value={ JSON.stringify({ name: '-Mute-'})} >{'-Mute-'}</option>
				{inputOptions}
			</select>
		</motion.div>
	)
}

let Home = () => {
	let { transmitters, receivers, spotify } = useContext(DevicesContext)
	let allSources = [ ... transmitters, ...spotify]
	let [ selected, setSelected ] = useState({})

	let handleInputChange = ({ip, value}) => {
		let tx = JSON.parse(value)
		setReceiverSource( ip, tx )
	}

	let handleVolumeChange = ({ip, value}) => {
		setVolume( ip, value )
	}
	
	let inputOptions = allSources.map((transmitter, i)=>{
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
			setSelected={setSelected}
		/>
	})

	return(
			<motion.div
				className="w-full text-xl flex h-full flex-col overflow-hidden justify-between"
				key={'home'}
				initial={{opacity: 0}}
				animate={{opacity: 1}}
				exit={{opacity: 0}}
				transition={{ delay: 0, duration:0.3, ease: "easeInOut" }}
			>

				<Header title="Home" />

				<div className="flex-grow">
					<div className="flex flex-col w-full ">
						{zones}
					</div>
				</div>

				<Selector selected={selected} handleInputChange={handleInputChange} setSelected={setSelected} inputOptions={inputOptions} />

			</motion.div>
	)	
}

export default Home;
