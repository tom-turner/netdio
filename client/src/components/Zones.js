import { useState, useEffect } from "react";
import {ReactComponent as LoadingMeters}  from '../assets/loadingMeters.svg';


export function Zones({ children }) {
	return(
		<div className="flex flex-col w-full p-4 pt-8 space-y-4 ">
			{children}
		</div>
	)	
}


export function Zone({ receiver, transmitters, muted, handleInputChange, handleVolumeChange }) {
	let [ selected, setSelected ] = useState(true)

	let inputOptions = transmitters.map((transmitter, i)=>{
		return <option key={i} value={JSON.stringify(transmitter)}>{transmitter.name}</option>
	})

	return(
			<div className={`border shadow-sm w-full p-4 space-y-4 rounded ${ selected ? 'border-zinc-800' : 'border-zinc-300 shadow-sm' }`} >
			 	
				<div className="flex justify-between">
			 		<p className="font-bold text-zinc-800"> {receiver.name} </p>
			 		<div className={`${ muted || selected ? '' : 'hidden'}`}>
						<select onChange={ (e) => { handleInputChange({ ip: receiver.ip , value: e.target.value }) } } defaultValue={'default'} >
							<option disabled value={'default'} >{`Input: ${receiver.source.name} `}</option>
							<option value={ JSON.stringify({ name: '-Mute-'})} >{'-Mute-'}</option>
							{inputOptions}
						</select>
			 		</div>
			 		<LoadingMeters className={`h-6 fill-zinc-800 ${ muted || selected ? 'hidden' : ''}`} />
			 	</div>

			 	<input defaultValue={receiver.volume} type="range" className={`w-full `} onChange={ (e) => { handleVolumeChange({ ip: receiver.ip, value: e.target.value }) }} />
			 </div>
	)	
}
