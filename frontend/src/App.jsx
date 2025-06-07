import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import './App.css'
import SignIn from "./pages/SignIn";
import Navbar from "./components/Navbar";

function App() {
  return (
    <BrowserRouter>
        <Navbar/>
      <Routes>
        <Route path="/" element={<Home />} />           
        <Route path="/signin" element={<SignIn />} />     
      </Routes>
    </BrowserRouter>
  );
}

export default App;
