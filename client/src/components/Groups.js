import { DevicesContext } from '../context/Devices';
import { useState, useRef, useContext } from "react";
import { motion } from 'framer-motion'
import {ReactComponent as LoadingMeters}  from '../assets/loadingMeters.svg';
import {ReactComponent as Muted}  from '../assets/muted.svg';



export function Group({ name, receiver, selected, setSelected, muted}) {
	return(
			<div className={`w-full bg-white ${ selected ? 'border-neutral-500 border shadow-md' : 'border-b border-neutral-300' }`} >
			 	
				<div className="flex justify-between w-full space-x-4 px-4 pt-4" onClick={ () => { setSelected(  selected ? {} : receiver)  }}>
			 		<div className="flex w-full" >
			 			<p  className={`font-bold text-base my-auto text-neutral-800 w-full flex grow truncate `}> {receiver.name} </p>
			 			<LoadingMeters className={`h-6 fill-s-800 ${ muted || selected ? 'hidden' : ''}`} />
			 			<Muted className={`h-6 fill-s-800 ${ muted ? '' : 'hidden'} ${ selected ? 'hidden' : ''}`} />
			 		</div>
			 		<div className={`text-right w-full ${ selected ? '' : 'hidden'}`}>
			 			<p className={`text-base my-auto text-neutral-800 truncate`}>{ ` Source: ${receiver.source.name} `}</p>
			 		</div>
			 	</div>
			 	<div className="px-4 pb-4">
			 		{ /* <input defaultValue={receiver.volume} type="range" className={`w-full`} onChange={ (e) => { handleVolumeChange({ ip: receiver.ip, value: e.target.value }) }} /> */}
			 	</div>
			 </div>
	)	
}




let Groups = ({error}) => {
	let { receivers } = useContext(DevicesContext)
	let groups = []

	receivers.map((receiver) => {
		if(!receiver.group)
			return 

		groups[receiver.group] = [ ...groups, receiver ]
	})

	let groupComponents = groups.map((group)=> {
		//<Groups name={} />
	})

	return(
			<motion.div 
				className="w-full text-xl flex flex-col overflow-hidden justify-between"
				key={'groups'}
				initial={{opacity: 0}}
				animate={{opacity: 1}}
				exit={{opacity: 0}}
				transition={{ delay: 0, duration:0.3, ease: "easeInOut" }}
			>

				<div className="border-b border-neutral-200 flex justify-between pt-8 p-4 text-neutral-900 text-center shadow-inner">
					<div className="my-auto w-full">
						
					</div>
					<h2 className="font-bold w-full" >Groups</h2>
					
					<div className="flex justify-between w-full">
						<p className="font-bold"></p>
						<button className="bg-neutral-900 px-4 py-1 text-base rounded text-white">Add</button>
					</div>

				</div>

				<div className="h-full flex flex-col p-4 space-y-2">
					
					{groupComponents}
					
				</div>

			</motion.div>
	)		
}

export default Groups;
