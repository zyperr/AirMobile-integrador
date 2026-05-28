import SidebarAdmin from "../components/admin/SidebarAdmin";
import HeaderAdmin from "../components/admin/HeaderAdmin";
import TablaDeProductos from "../components/admin/TablaDeProductos";
import "../style/GestionAdmin.css";
import CargaMasiva from "../components/admin/CargaMasiva";
import ModaleNuevoProducto from "../components/admin/ModaleNuevoProducto";
import { useState } from "react";

const GestionAdmin = () => {

    const [modaleNuevoProducto, setModaleNuevoProducto] = useState(false);


    return (
        <div className="admin-layout">
            <SidebarAdmin />
            <div className="admin-contenido">
                <HeaderAdmin />
                <main className="admin-main">
                    {/* ENCABEZADO DE LA PÁGINA */}
                    <div className="d-flex align-items-center justify-content-between mb-4">
                        <div>
                            <h1 className="admin-page-titulo">Inventario</h1>
                            <p className="admin-page-subtitulo">
                                Gestiona tu catálogo de dispositivos, niveles de
                                existencias y precios para el ecosistema Air Mobile.
                            </p>
                        </div>

                        <div className="d-flex gap-2">
                            <button className="admin-btn-exportar">Exportar CSV</button>

                            <button className="admin-btn-nuevo" onClick={()=> setModaleNuevoProducto(true)}>
                            <i className="bi bi-plus me-1" />Nuevo Producto
                            </button>
                        </div>

                    </div>

                    {/*  Tabla de productos utiliza el componente Badge de Estados */}
                    <TablaDeProductos />
                    <CargaMasiva />
                    < ModaleNuevoProducto  isOpen={modaleNuevoProducto} onClose={setModaleNuevoProducto (false)} />

                </main>
            </div>
        </div>
    );
};

export default GestionAdmin;