import './App.css';
import { Routes, Route, BrowserRouter } from "react-router-dom";
import Home from "./components/Home"
import Settings from "./components/Settings"

function App() {
  return <BrowserRouter>
    <Routes>
      <Route path="/" element={ <Home /> } />
      <Route path="/settings" element={ <Settings /> } />
    </Routes>
  </BrowserRouter>
}

export default App;
