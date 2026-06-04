import { useState, useEffect } from "react";
import { useApi } from "../../hooks/useApi";
import { useAuth } from "../../context/AuthContext";
import Paginacion from "../common/Paginacion";
import { SkeletonFilaProducto } from "./SkeletonFilaLoader";
import { ProductosFila } from "./ProductoFila";
import BagdeEstado from "../common/BadgeEstado";
import ModalConfirmarEliminar from "./forms/ModalConfirmarEliminar";
import ModalEditarProducto from "./forms/ModalEditarProducto";



const TablaProductos = () => {

    // Paginación
    const [paginaActual, setPaginaActual] = useState(1);

    // Token para autenticación
    const { token } = useAuth();

    // Una sola instancia de useApi para todo
    const { ejecutarPeticion, isLoading, error } = useApi();
    const [productos, setProductos] = useState([]);

    // Modal de confirmación para eliminar producto
    const [modalEliminar, setModalEliminar] = useState(false);
    const [productoAEliminar, setProductoAEliminar] = useState(null);

    // Modal para editar producto
    const [modalEditar, setModalEditar] = useState(false);
    const [productoAEditar, setProductoAEditar] = useState(null);
  

    // Carga de productos
    useEffect(() => {
        const cargarProductos = async () => {
            const respuesta = await ejecutarPeticion(`productos/productos?limit=3&page=${paginaActual}`, {
                method: "GET",
            });
            if (respuesta.exito) {
                setProductos(respuesta.data);
            }
        };
        cargarProductos();
    }, [paginaActual]);

    // Abre el modal en vez del window.confirm
    const abrirModalEliminar = (id, nombre) => {
        setProductoAEliminar({ id, nombre });
        setModalEliminar(true);
    };

    // Se ejecuta cuando el admin confirma en el modal
    const confirmarEliminar = async () => {
        const result = await ejecutarPeticion(`productos/eliminar-producto/${productoAEliminar.id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        });

        if (result.exito) {
            setProductos(prev => ({
                ...prev,
                data: prev.data.filter(p => p.id !== productoAEliminar.id)
            }));
        } else {
            alert("No se pudo eliminar el producto. Intentá de nuevo.");
        }

        setModalEliminar(false);
        setProductoAEliminar(null);
    };

    // Función abrir modal editar
    const abrirModalEditar = (id) => {
        const producto = productos.data.find(p => p.id === id);
        setProductoAEditar(producto);
        setModalEditar(true);
    };
    // Función actualizar lista sin recargar
    const actualizarProductoEnLista = (id, datosActualizados) => {
        
        setProductos(prev => {
            // 1. Verificamos si tu estado es directamente un Array o si está adentro de "data"
            const esArrayDirecto = Array.isArray(prev);
            const listaOriginal = esArrayDirecto ? prev : prev?.data || [];

            // 2. Mapeamos usando doble igual (==) por si hay diferencias entre String y Number
            const nuevaLista = listaOriginal.map(p =>
                p.id == id ? { ...p, ...datosActualizados } : p
            );

            // 3. Devolvemos el estado respetando su estructura original
            if (esArrayDirecto) {
                return nuevaLista;
            } else {
                return {
                    ...prev,
                    data: nuevaLista
                };
            }
        });
    };


    // Cambiar página
    const cambiarPagina = (pagina) => {
        setPaginaActual(pagina);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    if (error) {
        return (
            <div className="tabla-card p-4">
                <p className="text-danger">Error al cargar productos: {error}</p>
            </div>
        );
    }

    return (
        
        <div className="tabla-card">

            {/* Encabezado */}
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

            {/* Columnas */}
            <div className="tabla-columnas d-flex">
                <span className="tabla-col-nombre">NOMBRE DEL PRODUCTO</span>
                <span className="tabla-col-estado">ESTADO</span>
                <span className="tabla-col-precio">PRECIO</span>
                <span className="tabla-col-acciones"></span>
            </div>

            {/* Filas */}
            {(isLoading || !productos) ? (
                <SkeletonFilaProducto cantidad={3} />
            ) : (
                productos?.data?.map((producto) => (
                    <ProductosFila
                        key={`key-id-${producto.id}`}
                        condicion={producto.condicion}
                        id={producto.id}
                        imagen_url={producto.imagen_url[0]}
                        nombre_producto={producto.nombre_producto}
                        precio={producto.precio}
                        onEliminar={(id) => abrirModalEliminar(id, producto.nombre_producto)}
                        onEditar={abrirModalEditar}
                    />
                ))
            )}

            {/* Paginación */}
            <div className="tabla-footer">
                <Paginacion
                    paginaActual={paginaActual}
                    cambiarPagina={cambiarPagina}
                    tienePaginaAnterior={productos?.paginacion?.tienePaginaAnterior}
                    tienePaginaSiguiente={productos?.paginacion?.tienePaginaSiguiente}
                />
            </div>
            <ModalConfirmarEliminar
                isOpen={modalEliminar}
                nombreProducto={productoAEliminar?.nombre}
                onConfirmar={confirmarEliminar}
                onCancelar={() => {
                    setModalEliminar(false);
                    setProductoAEliminar(null);
                }}
            />

            <ModalEditarProducto
                isOpen={modalEditar}
                producto={productoAEditar}
                onClose={() => {
                    setModalEditar(false);
                    setProductoAEditar(null);
                }}
                onProductoActualizado={actualizarProductoEnLista}
            />

        </div>
    );
};

export default TablaProductos;