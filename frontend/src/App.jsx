import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
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
import { Administracion } from "./components/admin/Administracion";
import { Inventario } from "./components/admin/Inventario";
import { Facturas } from "./components/admin/Facturas";
import InformacionGeneral from "./components/cuenta/tabs/InformacionGeneral.jsx";
import FacturacionPerfil from "./components/cuenta/tabs/FacturacionPerfil.jsx";
import Seguridad from "./components/cuenta/tabs/Seguridad.jsx";
import ListaDeseosPerfil from "./components/cuenta/tabs/ListaDeseosPerfil.jsx";
import Error404 from "./components/common/Error404.jsx";
import PagoExitoso from "./pages/PageExitoso.jsx";
import PagoPendiente from "./pages/PagoPendiente.jsx";
import PagoFallido from "./pages/PagoFallido.jsx";


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
        {/* Rutas para el panel de administración */}
        <Route path="/admin" element={<GestionAdmin />} >
          <Route index element={<Navigate to="administracion" replace />} />
          <Route path="administracion" element={<Administracion />} />
          <Route path="inventario" element={<Inventario />} />
          <Route path="facturas" element={<Facturas />} />
        </Route>
        {/* Rutas para el perfil del usuario */}
        <Route path="/perfil-usuario/" element={<PerfilUsuario />} >
          <Route index element={<Navigate to="informacion" replace />} />
          <Route path="informacion" element={<InformacionGeneral />} />
          <Route path="seguridad" element={<Seguridad />} />
          <Route path="facturacion" element={<FacturacionPerfil />} />
          <Route path="deseos" element={<ListaDeseosPerfil />} />
        </Route>
        {
          estaAutenticado && <Route path="/carrito" element={<Carrito />} />
        }
        <Route path="/pago-exitoso" element={<PagoExitoso />} />
        <Route path="/pago-fallido" element={<PagoFallido />} />
        <Route path="/pago-pendiente" element={<PagoPendiente />} />
        <Route path="*" element={<Error404 />} />
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