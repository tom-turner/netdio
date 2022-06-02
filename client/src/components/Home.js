import { useState, useEffect } from "react";
import { getNetworkDeviceList } from '../lib/api'
import Loading from './Loading'
import { Zones, Zone } from './Zones'

let Home = () => {
	let [ deviceList, setDeviceList ] = useState([])

	useEffect(() => {
		setInterval( async () => {
			setDeviceList( await getNetworkDeviceList() )
		}, 1000)
	}, []);

	console.log(deviceList)

	if(deviceList.length == 0)
		return <Loading loadedWhen={deviceList.length !== 0} />

	return(
			<div className="w-full h-screen text-xl flex flex-col overflow-hidden" >

				<div className="border-b border-zinc-300 pt-12 pb-4 text-zinc-800 text-center font-bold shadow-inner">
					<h2 >Home</h2>
				</div>


				<Zones className="flex flex-col w-full p-4 pt-8 space-y-4 ">
					<Zone selected={false} />
					<Zone selected={true} />
				</Zones >
			</div>
	)	
}

export default Home;
