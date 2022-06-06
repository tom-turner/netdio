import { useNavigate } from "react-router-dom";
import {ReactComponent as Settings}  from '../assets/settings.svg';
import {ReactComponent as Group}  from '../assets/group.svg';
import {ReactComponent as Home}  from '../assets/home.svg';


let Navbar = () => {
	let navigate = useNavigate();

	return (
		<div className={`flex justify-center pt-1 px-12 pb-8 bg-neutral-900 text-white w-full transition-all duration-250 items-end `}>
			<div className="flex justify-between w-full max-w-md">
				<button className={`font-bold py-2 px-4 `}>
					<Group className="fill-white w-6 h-6" />
				</button>
				<button className={`font-bold py-2 px-4 `}>
					<Home className="fill-white w-6 h-6" onClick={ () => { navigate('/')}} />
				</button>						
				<button className={`font-bold py-2 px-4 `}>
					<Settings className="fill-white w-6 h-6" onClick={ () => { navigate('/settings')}} />
				</button>
			</div>
		</div>
	)
}

export default Navbar;