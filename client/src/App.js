import './App.css';
import { BrowserRouter } from "react-router-dom";
import Routes from "./Routes"
import { AnimatePresence } from 'framer-motion'

function App() {
  return (
    <BrowserRouter>
      <AnimatePresence>
        <Routes />
      </AnimatePresence>
    </BrowserRouter>
  )
}

export default App;
