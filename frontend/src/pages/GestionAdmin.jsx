import SidebarAdmin from "../components/SidebarAdmin";
import HeaderAdmin from "../components/HeaderAdmin";
import TablaDeProductos from "../components/TablaDeProductos";
import "../style/GestionAdmin.css";
import CargaMasiva from "../components/CargaMasiva";

const GestionAdmin = () => {
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

                            <button className="admin-btn-nuevo">
                            <i className="bi bi-plus me-1" />Nuevo Producto
                            </button>
                        </div>

                    </div>

                    {/*  Tabla de productos utiliza el componente Badge de Estados */}
                    <TablaDeProductos />
                    <CargaMasiva />
                </main>
            </div>
        </div>
    );
};

export default GestionAdmin;