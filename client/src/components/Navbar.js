import { useNavigate } from "react-router-dom";
import {ReactComponent as Settings}  from '../assets/settings.svg';
import {ReactComponent as Group}  from '../assets/group.svg';
import {ReactComponent as Home}  from '../assets/home.svg';


let Navbar = () => {
	let navigate = useNavigate();

	return (
		<div className={`flex justify-center pt-1 px-4 pb-8 bg-neutral-900 text-white w-full `} >
			<div className="flex justify-between w-full max-w-md" >
				<button className={`font-bold py-2 px-4 w-full`} onClick={ () => { navigate('/groups') }}>
					<Group className="fill-white w-6 h-6 mx-auto" />
					<p className="text-sm" >Groups</p>
				</button>
				<button className={`font-bold py-2 px-4 w-full`} onClick={ () => { navigate('/') }} >
					<Home className="fill-white w-full h-6 mx-auto"  />
					<p className="text-sm">Home</p>
				</button>						
				<button className={`font-bold py-2 px-4 w-full`} onClick={ () => { navigate('/settings') }} >
					<Settings className="fill-white w-full h-6 mx-auto" />
					<p className="text-sm">Settings</p>
				</button>
			</div>
		</div>
	)
}

export default Navbar;