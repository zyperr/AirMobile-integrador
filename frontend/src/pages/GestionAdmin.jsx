import { useState } from "react";
import { Inventario } from "../components/admin/Inventario";
import SidebarAdmin from "../components/admin/SidebarAdmin";
import "../style/GestionAdmin.css";
import { Administracion } from "../components/admin/Administracion";
import { Facturas } from "../components/admin/Facturas";

const menuitems = [
    { id: 1, nombre: "Administracion", icono: "bi-grid" },
    { id: 2, nombre: "inventario", icono: "bi-archive" },
    { id: 3, nombre: "Facturas", icono: "bi-cart3" },
];

const GestionAdmin = () => {
    const [tabs, setTabs] = useState(1);



    return (
        <div className="admin-layout bg-light">
            <SidebarAdmin menuitems={menuitems} setTabs={setTabs} />
            <div className="admin-contenido">
                <main className="admin-main">
                    {
                        tabs === 1 && (
                            <><Administracion/></>
                        )
                    }
                    {
                        tabs === 2 && (
                            <Inventario />
                        )
                    }
                    {
                        tabs === 3 && (
                            <><Facturas/></>
                        )
                    }
                </main>
            </div>
        </div>
    );
};

export default GestionAdmin;