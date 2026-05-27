import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Carrito from "./pages/Carrito";
import Product from "./pages/Product";
import CatalogoDeProductos from "./pages/CatalogoDeProductos";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import InicioSesion from "./pages/InicioSesion";
import Registro from "./pages/Registro";
import { RecuperarContraseña } from "./pages/RecuperarContraseña";
import PerfilUsuario from "./pages/PerfilUsuario";


function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/producto/:id" element={<Product />} />
        <Route path="/catalogo" element={<CatalogoDeProductos />} />
        <Route path="/inicio-sesion" element={<InicioSesion />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/recuperar-password" element={<RecuperarContraseña />} />
        <Route path="/perfil-usuario/" element={<PerfilUsuario />} />
        <Route path="/carrito" element={<Carrito />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;