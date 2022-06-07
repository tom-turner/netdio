import './App.css';
import { BrowserRouter } from "react-router-dom";
import Routes from "./components/Routes"

function App() {
  return (
    <BrowserRouter>
      <Routes />
    </BrowserRouter>
  )
}

export default App;
