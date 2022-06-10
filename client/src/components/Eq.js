import { useState, useContext, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getEq } from '../lib/api'
import { Header } from './Header'
import Loading from './Loading'

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

	console.log(eqState)

	if(eqState.error)
		return (
			<div>
				<Header title="Settings" back="/settings" />
				<p className="pt-4 px-4 font-bold text-xl ">{name}</p>
				<p className="p-4"> This device does not have EQ </p>
			</div>
	)

	return(
		<div>
		<Header title="Settings" back="/settings" />
			<p className="pt-4 px-4 font-bold text-xl ">{name + ' EQ'}</p>

		</div>
	)
}

export default Eq;