import { Outlet } from "react-router-dom";
import SidebarAdmin from "../components/admin/SidebarAdmin";
import "../style/GestionAdmin.css";

// Ya no necesitamos importar los componentes de las vistas acá,
// porque React Router se encarga de inyectarlos.

const menuitems = [
    { path: "administracion", nombre: "Administracion", icono: "bi-grid" },
    { path: "inventario", nombre: "Inventario", icono: "bi-archive" },
    { path: "facturas", nombre: "Facturas", icono: "bi-cart3" },
];

const GestionAdmin = () => {
    // ¡Chau useState! La URL manda ahora.

    return (
        <div className="admin-layout bg-light">
            <SidebarAdmin menuitems={menuitems} />
            <div className="admin-contenido">
                <main className="admin-main">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default GestionAdmin;