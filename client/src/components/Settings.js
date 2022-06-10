import { useState, useContext, useEffect } from "react";
import { DevicesContext } from '../context/Devices';
import { setName, resetDevice, getDeviceConfig } from '../lib/api'
import { motion } from 'framer-motion'
import { useNavigate, useSearchParams } from "react-router-dom";
import { Header } from './Header'
import Loading from './Loading'
import {ReactComponent as Arrow}  from '../assets/arrow.svg';
import {ReactComponent as Dots}  from '../assets/dots.svg';
import {ReactComponent as Available}  from '../assets/available.svg';

export function DeviceSettings() {
	let navigate = useNavigate()
	let [ searchParams ] = useSearchParams()
	let devicesContext = useContext(DevicesContext)
	let ip = searchParams.get('ip')
	let name = searchParams.get('name')

	let config = []
	Object.values(devicesContext).map((type, i)=>{
		type.map((service, i) => {
			if(service.ip === ip)
				config[service.type] = service
		})
	})

	if(!config)
		return <Loading />


	let Name = ({service}) => {
		let [clicked, setClicked] = useState(false) // clicked gets reset every time state updates, this might cause bugs if updates happen at the same time as user input. 

		if(!clicked)
			return <p className="p-1 w-full my-auto" onClick={()=>{ setClicked(true) }}>{service.name}</p>

		return (
			<input autoFocus 
				className="w-full p-1 my-auto" 
				type="text" 
				placeholder={service.name} 
				onChange={ (e) => {  } } 
				onBlur={ () => { 
					setClicked(false)
				} }
				onKeyUp={(e)=>{
					if(e.key === 'Enter') {
						setName(service.ip, service.type ,e.target.value)
						setClicked(false)
					}
				}}
			/>
		)
	}

	let services = Object.values(config).map((service, i)=>{
		let key = Object.keys(config)[i]
		return (
			<div key={i} className="text-base bg-white p-4 flex justify-between" onClick={ ()=>{  }}>
				<div className="flex space-x-4 w-full">
					<Available className="fill-green-400 animate-pulse h-5 w-5 my-auto" />
					<p className="my-auto">{service.type.toUpperCase()}</p>
					<Name service={service} />
				</div>
			</div>
		)
	})

	let rxItems = () => { if(config.rx) return (
			<div>
				<li className="px-4 py-4 flex justify-between border-b border-neutral-300" onClick={ () => { navigate('/settings/groups')}}> 
					<p className="my-auto">Groups</p>
					<Arrow className="rotate-180 my-auto fill-neutral-500" />
				</li>
				<li className="px-4 py-4 flex justify-between border-b border-neutral-300" onClick={ () => { navigate(`/settings/eq?ip=${config.rx.ip}&name=${config.rx.name}`)}}> 
					<p className="my-auto">EQ</p>
					<Arrow className="rotate-180 my-auto fill-neutral-500" />
				</li>
			</div>
		)
	}

	let txItems = () => { if(config.tx) return (
			<div></div>
		)
	} 

	return (
		<div>
		<Header title="Settings" back="/settings" />
			<p className="pt-4 px-4 font-bold text-xl ">{name}</p>

			<div className="border-b border-neutral-300">
				{services}
			</div>
			<div className="flex flex-col">
				<ol>
					{rxItems()}
					{txItems()}
					<li className="px-4 py-4 flex justify-between border-b border-neutral-300" onClick={ () => { navigate('/settings/reset')}}> 
						<p className="my-auto">Reset</p>
						<Arrow className="rotate-180 my-auto fill-neutral-500" />
					</li>
				</ol>
			</div>	
		</div>
	)
}

export function SpotifySettings() {
	let navigate = useNavigate()
	let [ searchParams ] = useSearchParams()
	let [ config, setConfig ] = useState(null)
	let ip = searchParams.get('ip')
	let name = searchParams.get('name')

	useEffect(() => {
		( async () => {
			setConfig(await getDeviceConfig({ip: ip}, 'spotify'))
		})()
	}, []);

	if(!config)
		return <Loading />

	return (
		<div>
		<Header title="Settings" back="/settings" />
			<p className="p-4">{JSON.stringify(config)}</p>
			<div className="flex flex-col">
				<ol>
					<li className="px-4 py-4 flex justify-between border-b border-neutral-300" onClick={ () => { navigate(`${window.location.pathname}/spotify/name?ip=${ip}`)}}> 
						<p className="my-auto">Name</p>
						<Arrow className="rotate-180 my-auto fill-neutral-500" />
					</li>
					<li className="px-4 py-4 flex justify-between border-b border-neutral-300" onClick={ () => { navigate('/settings/reset')}}> 
						<p className="my-auto">Reset</p>
						<Arrow className="rotate-180 my-auto fill-neutral-500" />
					</li>
				</ol>
			</div>	
		</div>
	)
}


export function Settings() {
	let navigate = useNavigate()
	let devicesContext = useContext(DevicesContext)

	let deviceList = []

	for (let deviceType of Object.values(devicesContext)){
		deviceType.map((device)=>{
			deviceList[device.ip] = { ...deviceList[device.ip] ,[device.type]: device, ip : device.ip }
		})
	}

	let devices = Object.values(deviceList).map((device, i) => {
		let muted = device.rx ? device.rx.socket ? false : true : true
		let name = device.rx ? device.rx.name : device.tx ? device.tx.name : null // this sets device name with a preferance for RX, then TX.
		return (
			<div key={i} className="font-bold bg-white p-4 border-b border-neutral-300 flex justify-between" onClick={ ()=>{ navigate(`${window.location.pathname}/device?ip=${device.ip}&name=${name}`) }}>
				<p>{name}</p>
				<Dots className="my-auto h-6" />
			</div>
		)
	})

	let spotify = devicesContext.spotify.map((device, i)=>{
		return (
			<div key={i} className="text-base bg-white p-4  flex justify-between" onClick={ ()=>{ navigate(`${window.location.pathname}/spotify?ip=${device.ip}`) }}>
				<div className="flex space-x-4">
					<Available className="fill-green-400 animate-pulse h-5 my-auto" />
					<p>Spotify</p>
					<p>{device.name}</p>
				</div>
				<Dots className="my-auto h-6" />
			</div>
		)
	})

	return(
		<motion.div 
			className="w-full text-xl flex flex-col overflow-hidden justify-between"
			key={'settings'}
			initial={{opacity: 0}}
			animate={{opacity: 1}}
			exit={{opacity: 0}}
			transition={{ delay: 0, duration:0.3, ease: "easeInOut" }}
		>

			<Header title="Settings" />

		<div className="w-full text-xl flex flex-col overflow-hidden justify-between">

			<div className="flex flex-col">
				<div>
					{devices}
				</div>
				<div className="border-b border-neutral-300">
					<p className="p-4 font-bold">Streaming Services</p>
					{spotify}
				</div>
				
			</div>

		</div>

		</motion.div>
	)	
}
