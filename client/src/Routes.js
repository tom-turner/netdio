import { Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Tx, Rx, Spotify } from './lib/devices'
import Home from "./components/Home"
import { Settings, DeviceSettings, SpotifySettings } from "./components/Settings"
import Groups from "./components/Groups"
import Navbar from "./components/Navbar"
import Loading from './components/Loading'
import Eq from './components/Eq'
import { DevicesContext } from './context/Devices'


function AnimatedRoutes() {
	const location = useLocation()
	let [ error, setError ] = useState(null)
	let [ transmitters, setTransmitters ] = useState([])
	let [ receivers, setReceivers ] = useState([])
	let [ spotify, setSpotify ] = useState([])

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
		Spotify.subscribe(({ devices, error }) =>{
			if(error)
				return setError(error)

			setSpotify(devices)
		})
	}, []);

	if(transmitters.length === 0 && receivers.length === 0 )
		return <Loading error={error} />

	return (
		<DevicesContext.Provider value={{transmitters : transmitters, receivers: receivers, spotify: spotify}} >	
			<div className="flex flex-col justify-between h-screen">
				<Routes location={location} key={location.pathname} >
					<Route path="/" element={ <Home /> } />
					<Route path="/settings" element={ <Settings /> } />
					<Route path="/settings/device" element={ <DeviceSettings /> }/>
					<Route path="/settings/spotify" element={ <SpotifySettings /> }/>
					<Route path="/settings/eq" element={ <Eq /> }/>
					<Route path="/groups" element={ <Groups /> } />
					<Route path="*" element={ <Loading /> } />
				</Routes>
				<Navbar />
			</div>
		</DevicesContext.Provider>
	);
}

export default AnimatedRoutes;