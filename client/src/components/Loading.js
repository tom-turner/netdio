import { useState, useEffect } from "react";
import {ReactComponent as LoadingMeters}  from '../assets/loadingMeters.svg';
import {ReactComponent as LoadingDots}  from '../assets/loadingDots.svg';


let Loading = ({loadedWhen}) => {
	let [ready, setReady] = useState(false)

	setTimeout(()=>{
		setReady(true)
	},10)

	return(
			<div className="w-full h-screen bg-zinc-100 flex flex-col justify-center
			 items-center" >
				<LoadingMeters className={`mx-auto h-1/4 fill-zinc-800 transform transition-all duration-500 ease-in opacity-0 ${ ready ? 'opacity-100' : '' }` } />
			</div>
	)	
}

export default Loading;
