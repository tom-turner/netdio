import { useState, useContext, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getEq, setEqFlat, setEq } from '../lib/api'
import { Header } from './Header'
import Loading from './Loading'

let Slider = ({ip, defaultValue, title, param}) => {
	return (
		<div className="flex relative w-full mx-auto">
			<label className="text-black w-24 text-center whitespace-nowrap my-auto pr-4">{title}</label>
			<input defaultValue={defaultValue} onChange={(e)=>{ setEq(ip, e.target.name, e.target.value) }} className="h-2 w-full my-auto inset-y-0 rounded-full eq-slider" type="range" name={param} min="48" max="84" step='1'/>					
		</div>
	)
}

let EqSliders = ({ip, eqState}) => {

	let sliders = Object.values(eqState).map((obj)=>{
		return <Slider ip={ip} defaultValue={obj.level} param={obj.param} title={obj.param.split('.')[1]} />
	})

	return (
		<div className=" h-screen w-full text-white z-10 p-4">

			<div className="w-full bg-white rounded flex flex-row">

				<div className="flex flex-col justify-between space-y-2 w-full">	

					{sliders}

				</div>
				
			</div>

		</div>
	)
}


export function Eq(){
	let navigate = useNavigate()
	let [ searchParams ] = useSearchParams()
	let ip = searchParams.get('ip')
	let name = searchParams.get('name')
	let [ eqState, setEqState ] = useState(null)

	useEffect( () => {
		( async () => {
			setEqState( await getEq(ip) )
		} )()
	}, [])

	if(!eqState)
		return <Loading />

	if(eqState.error)
		return (
			<div>
				<Header title="Settings" back={`/settings/device?ip=${ip}&name=${name}`} />
				<p className="pt-4 px-4 font-bold text-xl ">{name}</p>
				<p className="p-4"> This device does not have EQ </p>
			</div>
	)

	return(
		<div>
		<Header title="Settings" back={`/settings/device?ip=${ip}&name=${name}`}/>
			<div className="flex justify-between pt-4 px-4">
				<p className="font-bold text-xl ">{name + ' EQ'}</p>
				<p className="rounded bg-neutral-800 px-2 my-auto text-white" onClick={() => { setEqFlat(ip); window.location.reload() }} >Flat EQ</p>
			</div>
			<EqSliders ip={ip} eqState={eqState} />
		</div>
	)
}

export default Eq;