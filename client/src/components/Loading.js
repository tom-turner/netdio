import { useState, useEffect } from "react";
import {ReactComponent as LoadingMeters}  from '../assets/loadingMeters.svg';
import {ReactComponent as LoadingDots}  from '../assets/loadingDots.svg';
import { motion } from 'framer-motion'

let Loading = ({error}) => {
	let [ready, setReady] = useState(false)

	setTimeout(()=>{
		setReady(true)
	},10)

	return(
			<motion.div
				className="w-full h-screen bg-neutral-100 flex flex-col justify-center items-center"
				initial={{opacity: 0}}
				animate={{opacity: 1}}
				exit={{opacity: 0}}
			 >
				<LoadingMeters className={`mx-auto h-1/4 fill-neutral-800 transform transition-all duration-500 ease-in opacity-0 ${ ready ? 'opacity-100' : '' }` } />
				<p className="py-2 text-red-500">{ error ? 'Connection Error' : ''}</p>
			</motion.div>
	)	
}

export default Loading;
