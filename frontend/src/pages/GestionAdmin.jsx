import { Outlet } from "react-router-dom";
import SidebarAdmin from "../components/admin/SidebarAdmin";
import { useState ,useEffect} from "react";
import "../style/GestionAdmin.css";

// Ya no necesitamos importar los componentes de las vistas acá,
// porque React Router se encarga de inyectarlos.

const menuitems = [
    { path: "administracion", nombre: "Administracion", icono: "bi-grid" },
    { path: "inventario", nombre: "Inventario", icono: "bi-archive" },
    { path: "facturas", nombre: "Facturas", icono: "bi-cart3" },
];

const GestionAdmin = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    useEffect(() => {
        if (isCollapsed) {
            document.body.classList.add("sidebar-colapsado");
            document.body.classList.remove("sidebar-abierto");
        } else {
            document.body.classList.add("sidebar-abierto");
            document.body.classList.remove("sidebar-colapsado");
        }

        // Limpieza: si salimos del panel de admin, removemos los márgenes
        return () => {
            document.body.classList.remove("sidebar-abierto", "sidebar-colapsado");
        };
    }, [isCollapsed]);
    return (
        <div className={`admin-layout bg-light ${isCollapsed ? "collapsed" : ""}`}>
            <SidebarAdmin
                menuitems={menuitems}
                isCollapsed={isCollapsed}
                toggleSidebar={toggleSidebar}
            />
            <div className="admin-contenido flex-grow-1">
                <main className="admin-main">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default GestionAdmin;