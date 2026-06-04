import React, { useState } from "react"
import ModalNuevoProducto from "./forms/ModalNuevoProducto"
import TablaProductos from "./TablaDeProductos"
import CargaMasivaAdmin from "./CargaMasiva"
export const Inventario = () => {
    const [modaleNuevoProducto, setModaleNuevoProducto] = useState(false);

    return (
        <>
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

                    <button className="admin-btn-nuevo" onClick={() => setModaleNuevoProducto(!modaleNuevoProducto)}>
                        <i className="bi bi-plus me-1" />Nuevo Producto
                    </button>
                </div>
                
            </div>
            <TablaProductos />
            <CargaMasivaAdmin />
            < ModalNuevoProducto isOpen={modaleNuevoProducto} onClose={() => setModaleNuevoProducto(false)} />
        </>
    )
} 