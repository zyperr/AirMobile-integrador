import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Product from "./pages/Product";
import CatalogoDeProductos from "./pages/CatalogoDeProductos";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import InicioSesion from "./pages/InicioSesion";
import Registro from "./pages/Registro";


function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product" element={<Product />} />
        <Route path="/catalogo" element={<CatalogoDeProductos />} />
        <Route path="/inicio-sesion" element={<InicioSesion />} /> 
        <Route path="/registro" element={<Registro />} />
      </Routes>
          <Footer />
    </BrowserRouter>
  );
}

export default App;