import { useState, useEffect } from "react";
import { useApi } from "../../hooks/useApi";
import BadgeEstado from "../common/BadgeEstado";
import Paginacion from "../common/Paginacion";
import {SkeletonFilaProducto} from "./SkeletonFilaLoader";
import {ProductosFila} from "./ProductoFila";



const TablaProductos = () => {
//Cambiar  pagina
const [paginaActual, setPaginaActual] = useState(1);

// Datos de la API
    const { ejecutarPeticion:fecthProductos, isLoading, error } = useApi();
    const [productos, setProductos] = useState([]);

    useEffect(() => { 
        const cargarProductos = async () => {
            const respuesta = await fecthProductos(`productos/productos?limit=3&page=${paginaActual}`,{
                method: "GET",
            });
            if (respuesta.exito) {
                setProductos(respuesta.data);
                console.log("Productos cargados:", respuesta.data);
            }
        };
        cargarProductos();
    },[paginaActual]);


    if (error) {
        return (
            <div className="tabla-card p-4">
                <p className="text-danger">Error al cargar productos: {error}</p>
            </div>
        );
    }

    const cambiarPagina = (pagina) => {
        setPaginaActual(pagina);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="tabla-card">

            {/* Encabezado*/}
            <div className="tabla-header d-flex align-items-center justify-content-between">
                <h2 className="tabla-titulo">Productos Activos</h2>
                <div className="d-flex gap-2">
                    <button className="tabla-icono-btn" title="Filtrar">
                        <i className="bi bi-filter" />
                    </button>
                    <button className="tabla-icono-btn" title="Ordenar">
                        <i className="bi bi-sort-down" />
                    </button>
                </div>
            </div>

            <div className="tabla-columnas d-flex">
                <span className="tabla-col-nombre">NOMBRE DEL PRODUCTO</span>
                <span className="tabla-col-estado">ESTADO</span>
                <span className="tabla-col-precio">PRECIO</span>
            </div>

            {/* Fila de productos */}
                {(isLoading || !productos) ? (
                <SkeletonFilaProducto cantidad={3} />
            ) : (
                productos?.data?.map((producto) => (
                    <ProductosFila 
                        key={`key-id-${producto.id}`} // El key siempre va en el elemento que se repite
                        condicion={producto.condicion} 
                        id={producto.id} 
                        imagen_url={producto.imagen_url[0]} 
                        nombre_producto={producto.nombre_producto} 
                        precio={producto.precio} 
                    />
                ))
            )}

            {/* LINK VER TODOS */}
            <div className="tabla-footer">
                <Paginacion 
                    paginaActual={paginaActual} 
                    cambiarPagina={cambiarPagina} 
                    tienePaginaAnterior={productos?.paginacion?.tienePaginaAnterior} 
                    tienePaginaSiguiente={productos?.paginacion?.tienePaginaSiguiente} 
                />
            </div>

        </div>
    );
};

export default TablaProductos;