import { useNavigate } from "react-router-dom";
import {ReactComponent as Arrow}  from '../assets/arrow.svg';

export function Header({title, back, done }){
	let navigate = useNavigate()



	let arrow = <Arrow className="h-6" onClick={ () => { navigate(back)} } />
	let text = <p className="my-auto text-right w-full" onClick={ () => { navigate(done)} } >Done</p>

	return(
		<div className="border-b border-neutral-200 flex justify-between pt-8 p-4 text-neutral-900 text-center shadow-inner">
			

			<div className="my-auto w-full">
				{ back ? arrow : '' }
			</div>
			<h2 className="font-bold text-base w-full" >{title}</h2>
			<div className="my-auto w-full">
				{ done ? text : '' }
			</div>
			
		</div>
	)
}