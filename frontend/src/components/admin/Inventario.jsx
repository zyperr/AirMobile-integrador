import React, { useState } from "react"
import ModalNuevoProducto from "./forms/ModalNuevoProducto"
import TablaProductos from "./TablaDeProductos"
import CargaMasivaAdmin from "./CargaMasiva"
import { useApi } from "../../hooks/useApi"


export const Inventario = () => {
    const [modaleNuevoProducto, setModaleNuevoProducto] = useState(false);
    const [exportando, setExportando] = useState(false);
    const { ejecutarPeticion } = useApi();

    const exportarCSV = async () => {
    setExportando(true);
    try {
        const respuesta = await ejecutarPeticion("productos/productos?limit=10000&page=1", {
            method: "GET",
        });

        if (!respuesta.exito || !respuesta.data?.data?.length) {
            alert("No se pudieron obtener los productos.");
            return;
        }

        const productos = respuesta.data.data;

        // Solo los campos que acepta el schema
        const COLUMNAS = ["nombre_producto", "categoria", "precio", "condicion", "descripcion", "capacidad", "imagen_url", "bateria"];
        const SEP = ";"; // separador de columnas

        const escaparValor = (valor) => {
            if (valor === null || valor === undefined) return "";
            // Arrays los unimos con | sin espacios para que el backend los splitee limpio
            if (Array.isArray(valor)) return valor.join("|");
            const str = String(valor);
            if (str.includes(SEP) || str.includes('"') || str.includes("\n")) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        };

        const encabezado = COLUMNAS.join(SEP);
        const filas = productos.map((p) =>
            COLUMNAS.map((col) => escaparValor(p[col])).join(SEP)
        );

        // Sin BOM para evitar el problema del \uFEFF en el parser
        const csvContenido = [encabezado, ...filas].join("\n");
        const blob = new Blob([csvContenido], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `inventario_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

    } catch (err) {
        console.error("Error al exportar CSV:", err);
        alert("Ocurrió un error al exportar.");
    } finally {
        setExportando(false);
    }
};

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
                    <button
                        className="admin-btn-exportar"
                        onClick={exportarCSV}
                        disabled={exportando}
                    >
                        {exportando
                            ? <><i className="bi bi-hourglass-split me-1" />Exportando...</>
                            : <><i className="bi bi-download me-1" />Exportar CSV</>
                        }
                    </button>

                    <button
                        className="admin-btn-nuevo"
                        onClick={() => setModaleNuevoProducto(!modaleNuevoProducto)}
                    >
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