import { useState, useContext } from "react";
import { setReceiverSource, setVolume } from '../lib/api'
import { getLin, getLog } from '../lib/controls'
import { DevicesContext } from '../context/Devices'
import { Header} from './Header'
import { motion } from 'framer-motion'
import {ReactComponent as LoadingMeters}  from '../assets/loadingMeters.svg';
import {ReactComponent as Muted}  from '../assets/muted.svg';


let Zone = ({ receiver, inputOptions, handleInputChange, handleVolumeChange, selected, setSelected }) => {
	let muted = receiver.source.socket ? false : true

	return(
		<div className={`w-full bg-white ${ selected ? 'border-neutral-500 border shadow-md' : 'border-b border-neutral-300' }`}  onClick={ () => { setSelected(  receiver )  }}>
		 	
			<div className="flex justify-between w-full space-x-4 px-4 pt-4 z-10">
		 		<div className="flex w-full" >
		 			<p  className={`font-bold my-auto text-neutral-800 w-full flex grow truncate `}> {receiver.name} </p>
		 		</div>
		 		<Selector selected={selected} receiver={receiver} muted={muted} handleInputChange={handleInputChange} setSelected={setSelected} inputOptions={inputOptions} />
		 	</div>
		 	<div className="px-4 pb-4">
		 		<input defaultValue={getLin(receiver.volume)} type="range" className={`w-full`} onChange={ (e) => { handleVolumeChange({ ip: receiver.ip, value: getLog(e.target.value) }) }} />
		 	</div>
		</div>
	)	
}

let Selector = ({selected, muted, receiver, handleInputChange, setSelected, inputOptions}) => {
	if(!selected)
		return (
			<div>
				<LoadingMeters className={`h-6 w-6 fill-s-800 my-auto ${ muted || selected ? 'hidden' : ''}`} />
		 		<Muted className={`h-6 fill-s-800 my-auto w-6 ${ muted ? '' : 'hidden'} ${ selected ? 'hidden' : ''}`} />
			</div>
		)

	return (
		<div> 
			<select autoFocus 
				onBlur={ () => { setSelected({}) } } 
				className="text-right text-base my-auto text-neutral-800 w-full rounded z-50 px-2" 
				onChange={ (e) => { handleInputChange({ ip: receiver.ip , value: e.target.value }); setSelected({}) } } 
				defaultValue={'default'}
				style={{'WebkitAppearance': 'none','MozAppearance': 'none', 'appearance': 'none'}}
			>
				<option className="" disabled value={'default'} >{receiver.source.name}</option>
				<option value={ JSON.stringify({ name: '-Mute-'})} >{'-Mute-'}</option>
				{inputOptions}
			</select>
		</div>
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

			</motion.div>
	)	
}

export default Home;
