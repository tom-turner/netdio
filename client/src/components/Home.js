import { useState, useEffect } from "react";
import { getNetworkDeviceList } from '../lib/api'

let Home = () => {
	let [ deviceList, setDeviceList ] = useState()

	useEffect(() => {
		setInterval( async () => {
			setDeviceList( await getNetworkDeviceList() )
		}, 1000)
	}, []);

	if(!deviceList)
		return

	return(
			<div className="w-full h-screen bg-blue-400" >

			</div>
	)	
}

export default Home;
