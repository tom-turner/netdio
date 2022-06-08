import { Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Tx, Rx } from '../lib/devices'
import Home from "./Home"
import Settings, { EditName, SettingsList } from "./Settings"
import Groups from "./Groups"
import Navbar from "./Navbar"
import Loading from './Loading'
import { DevicesContext } from '../context/Devices'



function AnimatedRoutes() {
	const location = useLocation()
	let [ error, setError ] = useState(null)
	let [ transmitters, setTransmitters ] = useState([])
	let [ receivers, setReceivers ] = useState([])

	useEffect(() => {
		Tx.subscribe(({ devices, error }) =>{
			if(error)
				return setError(error)

			setTransmitters(devices)
		})
		Rx.subscribe(({ devices, error }) =>{
			if(error)
				return setError(error)

			setReceivers(devices)
		})
	}, []);

	if(transmitters.length === 0 && receivers.length === 0 )
		return <Loading error={error} />

	return (
		<DevicesContext.Provider value={{transmitters : transmitters, receivers: receivers}} >	
			<div className="flex flex-col justify-between h-screen">
				<Routes location={location} key={location.pathname} >
					<Route path="/" element={ <Home /> } />
					<Route path="/settings" element={ <Settings /> } />
					<Route path="/settings/edit-name" element={ <EditName /> }/>
					<Route path="/groups" element={ <Groups /> } />
					<Route path="*" element={ <Loading /> } />
				</Routes>
				<Navbar />
			</div>
		</DevicesContext.Provider>
	);
}

export default AnimatedRoutes;