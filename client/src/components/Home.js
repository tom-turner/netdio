import { useState, useEffect } from "react";
import { getTransmitters, getReceivers } from '../lib/api'
import Loading from './Loading'
import { Zones, Zone } from './Zones'

let Home = () => {
	let [ transmitters, setTransmitters ] = useState([])
	let [ receivers, setReceivers ] = useState([])

	useEffect(() => {
		setInterval( async () => {
			setTransmitters( await getTransmitters() )
			setReceivers( await getReceivers() )
		}, 1000)
	}, []);

	if(transmitters.length == 0 && receivers.length == 0 )
		return <Loading loadedWhen={transmitters.length !== 0} />


	let zones = receivers.map((rx, i) => {
		console.log(rx)
		return <Zone key={i} name={rx.name} />
	})

	return(
			<div className="w-full h-screen text-xl flex flex-col overflow-hidden" >

				<div className="border-b border-zinc-300 pt-12 pb-4 text-zinc-800 text-center font-bold shadow-inner">
					<h2 >Home</h2>
				</div>


				<Zones className="flex flex-col w-full p-4 pt-8 space-y-4 ">
					{zones}
				</Zones >
			</div>
	)	
}

export default Home;
