import { useState, useContext } from "react";
import { setReceiverSource, setVolume } from '../lib/api'
import { DevicesContext } from '../context/Devices'
import { Zones, Zone } from './Zones'
import { motion } from 'framer-motion'


let Home = () => {
	let { transmitters, receivers } = useContext(DevicesContext)
	let [ selected, setSelected ] = useState({})

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
			<motion.div
				className="w-full fixed top-0 text-xl flex flex-col overflow-hidden justify-between"
				key={'home'}
				initial={{opacity: 0}}
				animate={{opacity: 1}}
				exit={{opacity: 0}}
				transition={{ delay: 0, duration:0.3, ease: "easeInOut" }}
			>

				<div className="border-b border-neutral-200 pt-8 pb-4 text-neutral-900 text-center font-bold shadow-inner">
					<h2 >Home</h2>
				</div>

				<div className="h-full">
					<Zones className="flex flex-col w-full p-4 pt-8 space-y-4 flex-grow ">
						{zones}
					</Zones >
				</div>

			</motion.div>
	)	
}

export default Home;
