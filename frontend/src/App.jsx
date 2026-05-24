import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Product from "./pages/Product";
import CatalogoDeProductos from "./pages/CatalogoDeProductos";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import InicioSesion from "./pages/InicioSesion";
import Registro from "./pages/Registro";
import { RecuperarContraseña } from "./pages/RecuperarContraseña";
import PerfilUsuario from "./pages/PerfilUsuario";
import GestionAdmin from "./pages/GestionAdmin";

function Layout() {

  const location = useLocation();
    
    // Páginas donde no se usa Navbar ni Footer
    const esAdmin = location.pathname === "/admin";

  return (
    <>
      {!esAdmin && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/producto/:id" element={<Product />} />
        <Route path="/catalogo" element={<CatalogoDeProductos />} />
        <Route path="/inicio-sesion" element={<InicioSesion />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/recuperar-password" element={<RecuperarContraseña />} />
        <Route path="/perfil-usuario/" element={<PerfilUsuario />} />
        <Route path="/admin" element={<GestionAdmin />} />
      </Routes>
      {!esAdmin && <Footer />}
    </>
  );
}
function App() {
    return (
        <BrowserRouter>
            <Layout />
        </BrowserRouter>
    );
}

export default App;