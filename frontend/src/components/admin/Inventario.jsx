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
            // Traemos todos los productos sin límite de paginación
            const respuesta = await ejecutarPeticion("productos/productos?limit=9999&page=1", {
                method: "GET",
            });

            if (!respuesta.exito || !respuesta.data?.data?.length) {
                alert("No se pudieron obtener los productos.");
                return;
            }

            const productos = respuesta.data.data;

            // Tomamos las columnas del primer producto dinámicamente
            const columnas = Object.keys(productos[0]);

            // Función para escapar valores con comas o comillas
            const escaparValor = (valor) => {
                if (valor === null || valor === undefined) return "";
                const str = Array.isArray(valor) ? valor.join(" | ") : String(valor);
                // Si tiene coma, comilla o salto de línea, lo envolvemos en comillas
                if (str.includes(",") || str.includes('"') || str.includes("\n")) {
                    return `"${str.replace(/"/g, '""')}"`;
                }
                return str;
            };

            // Armamos el CSV: encabezado + filas
            const encabezado = columnas.join(",");
            const filas = productos.map((producto) =>
                columnas.map((col) => escaparValor(producto[col])).join(",")
            );
            const csvContenido = [encabezado, ...filas].join("\n");

            // Creamos el blob y disparamos la descarga
            const blob = new Blob(["\uFEFF" + csvContenido], {
                type: "text/csv;charset=utf-8;",
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            const fecha = new Date().toISOString().slice(0, 10); // ej: 2025-06-05
            link.href = url;
            link.setAttribute("download", `inventario_${fecha}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

        } catch (err) {
            console.error("Error al exportar CSV:", err);
            alert("Ocurrió un error al exportar. Revisá la consola.");
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