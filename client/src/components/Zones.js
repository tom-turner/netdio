import {ReactComponent as LoadingMeters}  from '../assets/loadingMeters.svg';


export function Zones({ children }) {

	return(
		<div className="flex flex-col w-full p-4 pt-8 space-y-4 ">
			{children}
		</div>
	)	
}


export function Zone({ zone, selected, muted }) {

	return(
			<div className={`border shadow-sm w-full p-4 space-y-4 rounded ${ selected ? 'border-zinc-800' : 'border-zinc-300 shadow-sm' }`} >
			 	
				<div className="flex justify-between">
			 		<p className="font-bold text-zinc-800"> Livingroom </p>
			 		<div className={`${ muted || selected ? '' : 'hidden'}`}>
			 			<InputSelect >
			 				
			 			</InputSelect>
			 		</div>
			 		<LoadingMeters className={`h-4 fill-zinc-800 ${ muted || selected ? 'hidden' : ''}`} />
			 	</div>

			 	<input type="range" className="w-full" />
			 </div>
	)	
}

export function InputSelect({children}) {

	return(
		<select >
			<option disabled selected value=''></option>
			{children}
		</select>

	)

}

export function InputOption({ name, value }) {
	return (
		<option value=''></option>
	)
}