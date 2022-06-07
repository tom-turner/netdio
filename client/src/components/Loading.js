import {ReactComponent as LoadingMeters}  from '../assets/loadingMeters.svg';
import { motion } from 'framer-motion'

let Loading = ({error}) => {
	return(
			<motion.div
				className="w-full h-screen bg-neutral-100 flex flex-col justify-center items-center"
				key={'loading'}
				initial={{opacity: 0}}
				animate={{opacity: 1}}
				exit={{opacity: 0}}
				transition={{ delay: 0, duration:1 }}
			 >
				<LoadingMeters className={`mx-auto h-1/4 fill-neutral-800 transform transition-all` } />
				<p className="py-2 text-red-500">{ error ? 'Connection Error' : ''}</p>
			</motion.div>
	)	
}

export default Loading;
