import {ReactComponent as LoadingMeters}  from '../assets/loadingMeters.svg';
import {ReactComponent as Muted}  from '../assets/muted.svg';
import { motion } from 'framer-motion'

export function Zones({ children }) {
	return(
		<div className="flex flex-col w-full p-4 pt-8 space-y-4 ">
			{children}
		</div>
	)	
}

export function Selector({selected, handleInputChange, setSelected, inputOptions}) {
	if(Object.values(selected).length === 0)
		return 

	return (
		<motion.div
			className="bg-neutral-900 w-full p-8 "
			initial={{opacity: 0}}
			animate={{opacity: 1}}
			exit={{opacity: 0}}
			transition={{ delay: 0, duration:0.3 }}
		> 
			<select autoFocus onBlur={ () => { setSelected({}) } } className="text-right text-base my-auto text-neutral-800 w-full p-4 rounded" onChange={ (e) => { handleInputChange({ ip: selected.ip , value: e.target.value }); setSelected({}) } } defaultValue={'default'} >
				<option className="" disabled value={'default'} >{selected.source.name}</option>
				<option value={ JSON.stringify({ name: '-Mute-'})} >{'-Mute-'}</option>
				{inputOptions}
			</select>
		</motion.div>
	)
}




export function Zone({ receiver, inputOptions, handleInputChange, handleVolumeChange, selected, setSelected }) {
	let muted = receiver.source.socket ? false : true

	return(
			<div className={`w-full rounded bg-white ${ selected ? 'border-neutral-500 border shadow-md' : 'border border-neutral-200 shadow-lg' }`} >
			 	
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
			 		<input defaultValue={receiver.volume} type="range" className={`w-full`} onChange={ (e) => { handleVolumeChange({ ip: receiver.ip, value: e.target.value }) }} />
			 	</div>
			 </div>
	)	
}
