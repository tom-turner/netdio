import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./Home"
import Settings from "./Settings"
import Navbar from "./Navbar"
import { AnimatePresence } from 'framer-motion'


function AnimatedRoutes() {
	const location = useLocation()

	return (
		<AnimatePresence>
			<Routes location={location} key={location.pathname} >
				<Route path="/" element={ <Home /> } />
				<Route path="/settings" element={ <Settings /> } />
			</Routes>
			<Navbar />
		</AnimatePresence>
	);
}

export default AnimatedRoutes;