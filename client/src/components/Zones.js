import { useState, useEffect } from "react";
import {ReactComponent as LoadingMeters}  from '../assets/loadingMeters.svg';


export function Zones({ children }) {
	return(
		<div className="flex flex-col w-full p-4 pt-8 space-y-4 ">
			{children}
		</div>
	)	
}


export function Zone({ receiver, transmitters, muted }) {
	let [ selected, setSelected ] = useState(true)

	let inputOptions = transmitters.map((transmitter, i)=>{
		return <option key={i} value={transmitter}>{transmitter.name}</option>
	})

	return(
			<div className={`border shadow-sm w-full p-4 space-y-4 rounded ${ selected ? 'border-zinc-800' : 'border-zinc-300 shadow-sm' }`} >
			 	
				<div className="flex justify-between">
			 		<p className="font-bold text-zinc-800"> {receiver.name} </p>
			 		<div className={`${ muted || selected ? '' : 'hidden'}`}>
						<select defaultValue={'default'} >
							<option disabled value={'default'} >{receiver.source.name}</option>
							{inputOptions}
						</select>
			 		</div>
			 		<LoadingMeters className={`h-6 fill-zinc-800 ${ muted || selected ? 'hidden' : ''}`} />
			 	</div>

			 	<input type="range" className={`w-full `} />
			 </div>
	)	
}
