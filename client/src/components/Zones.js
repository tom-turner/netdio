import { useState, useEffect } from "react";
import {ReactComponent as LoadingMeters}  from '../assets/loadingMeters.svg';
import {ReactComponent as Muted}  from '../assets/muted.svg';


export function Zones({ children }) {
	return(
		<div className="flex flex-col w-full p-4 pt-8 space-y-4 ">
			{children}
		</div>
	)	
}


export function Zone({ receiver, inputOptions, handleInputChange, handleVolumeChange, selected, setSelected }) {
	let muted = receiver.source.socket ? false : true

	return(
			<div className={`w-full p-4 space-y-4 rounded ${ selected ? 'border-neutral-500 border shadow-sm' : 'border border-neutral-200 shadow-lg' }`} >
			 	
				<div className="flex justify-between w-full space-x-4 ">
			 		<div className="flex w-full" onClick={ () => { setSelected( !selected ? receiver : null )} }>
			 			<p  className={`font-bold text-neutral-800 w-full flex grow truncate `}> {receiver.name} </p>
			 			<LoadingMeters className={`h-6 fill-s-800 ${ muted || selected ? 'hidden' : ''}`} />
			 			<Muted className={`h-6 fill-s-800 ${ muted ? '' : 'hidden'} ${ selected ? 'hidden' : ''}`} />
			 		</div>
			 		<div className={`w-1/3 ${ selected ? '' : 'hidden'}`}>
						<select className="text-right text-neutral-800 w-full" onChange={ (e) => { handleInputChange({ ip: receiver.ip , value: e.target.value }) } } defaultValue={'default'} >
							<option className="" disabled value={'default'} >{receiver.source.name}</option>
							<option value={ JSON.stringify({ name: '-Mute-'})} >{'-Mute-'}</option>
							{inputOptions}
						</select>
			 		</div>
			 	</div>

			 	<input defaultValue={receiver.volume} type="range" className={`w-full `} onChange={ (e) => { handleVolumeChange({ ip: receiver.ip, value: e.target.value }) }} />
			 </div>
	)	
}
