import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Carrito from "./pages/Carrito";
import Product from "./pages/Product";
import CatalogoDeProductos from "./pages/CatalogoDeProductos";
import Footer from "./components/layout/Footer";
import Navbar from "./components/layout/Navbar";
import InicioSesion from "./pages/InicioSesion";
import Registro from "./pages/Registro";
import { RecuperarContraseña } from "./pages/RecuperarContraseña";
import PerfilUsuario from "./pages/PerfilUsuario";
import { N8nChat } from "./components/chat/N8nChat.jsx";
import GestionAdmin from "./pages/GestionAdmin";
import { useAuth } from "./context/AuthContext.jsx";
import {Administracion} from "./components/admin/Administracion";
import {Inventario} from "./components/admin/Inventario";
import {Facturas} from "./components/admin/Facturas";
import { Navigate } from "react-router-dom";

function Layout() {

  const location = useLocation();
  const { estaAutenticado } = useAuth();
  // Páginas donde no se usa Navbar ni Footer
  const esAdmin = location.pathname === "/admin";

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/producto/:id" element={<Product />} />
        <Route path="/catalogo" element={<CatalogoDeProductos />} />
        <Route path="/inicio-sesion" element={<InicioSesion />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/recuperar-password" element={<RecuperarContraseña />} />
        <Route path="/perfil-usuario/" element={<PerfilUsuario />} />
        <Route path="/admin" element={<GestionAdmin />} >
          <Route index element={<Navigate to="administracion" replace />} />
          <Route path="administracion" element={<Administracion />} />
          <Route path="inventario" element={<Inventario />} />
          <Route path="facturas" element={<Facturas />} />
        </Route>
        {
          estaAutenticado && <Route path="/carrito" element={<Carrito />} />
        }
      </Routes>
      <N8nChat />
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