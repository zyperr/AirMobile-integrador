import { useState, useEffect, useRef } from "react";
import { useApi } from "../../hooks/useApi";
import { useAuth } from "../../context/AuthContext";
import Paginacion from "../common/Paginacion";
import { SkeletonFilaProducto } from "./SkeletonFilaLoader";
import { ProductosFila } from "./ProductoFila";
import ModalConfirmarEliminar from "./ModalConfirmarEliminar";
import ModalEditarProducto from "./ModalEditarProducto";

// Valores válidos según el backend (schemaProductos.js)
const CONDICIONES = ["nuevo", "usado", "reacondicionado"];
const CATEGORIAS = ["celulares", "tablets", "relojes", "auriculares", "cargadores", "cables", "powerbanks", "fundas", "protectores", "accesorios"];
const ORDENES = [
  { label: "Precio: menor a mayor", value: "asc" },
  { label: "Precio: mayor a menor", value: "desc" },
];

const TablaProductos = () => {
  const [paginaActual, setPaginaActual] = useState(1);
  const { token } = useAuth();
  const { ejecutarPeticion, isLoading, error } = useApi();
  const [productos, setProductos] = useState([]);

  // Estados de filtros
  const [condicionFiltro, setCondicionFiltro] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [ordenFiltro, setOrdenFiltro] = useState("");

  // Paneles abiertos/cerrados
  const [panelFiltro, setPanelFiltro] = useState(false);
  const [panelOrden, setPanelOrden] = useState(false);

  const refFiltro = useRef(null);
  const refOrden = useRef(null);

  // Modales
  const [modalEliminar, setModalEliminar] = useState(false);
  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [modalEditar, setModalEditar] = useState(false);
  const [productoAEditar, setProductoAEditar] = useState(null);

  // Cerrar paneles al hacer click afuera
  useEffect(() => {
    const handleClickAfuera = (e) => {
      if (refFiltro.current && !refFiltro.current.contains(e.target)) {
        setPanelFiltro(false);
      }
      if (refOrden.current && !refOrden.current.contains(e.target)) {
        setPanelOrden(false);
      }
    };
    document.addEventListener("mousedown", handleClickAfuera);
    return () => document.removeEventListener("mousedown", handleClickAfuera);
  }, []);

  // Carga de productos (se re-ejecuta cuando cambian filtros o página)
  useEffect(() => {
    const cargarProductos = async () => {
      // Armamos los query params solo con los valores que tienen contenido
      const params = new URLSearchParams();
      params.set("limit", "3");
      params.set("page", paginaActual);
      if (condicionFiltro) params.set("condicion", condicionFiltro);
      if (categoriaFiltro) params.set("categoria", categoriaFiltro);
      if (ordenFiltro) params.set("orden", ordenFiltro);

      const respuesta = await ejecutarPeticion(`productos/productos?${params.toString()}`, {
        method: "GET",
      });
      if (respuesta.exito) {
        setProductos(respuesta.data);
      }
    };
    cargarProductos();
  }, [paginaActual, condicionFiltro, categoriaFiltro, ordenFiltro]);

  const abrirModalEliminar = (id, nombre) => {
    setProductoAEliminar({ id, nombre });
    setModalEliminar(true);
  };

  const confirmarEliminar = async () => {
    const result = await ejecutarPeticion(`productos/eliminar-producto/${productoAEliminar.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (result.exito) {
      setProductos((prev) => ({
        ...prev,
        data: prev.data.filter((p) => p.id !== productoAEliminar.id),
      }));
    } else {
      alert("No se pudo eliminar el producto. Intentá de nuevo.");
    }
    setModalEliminar(false);
    setProductoAEliminar(null);
  };

  const abrirModalEditar = (id) => {
    const producto = productos.data.find((p) => p.id === id);
    setProductoAEditar(producto);
    setModalEditar(true);
  };

  const actualizarProductoEnLista = (id, datosActualizados) => {
    setProductos((prev) => {
      const esArrayDirecto = Array.isArray(prev);
      const listaOriginal = esArrayDirecto ? prev : prev?.data || [];
      const nuevaLista = listaOriginal.map((p) =>
        p.id == id ? { ...p, ...datosActualizados } : p
      );
      return esArrayDirecto ? nuevaLista : { ...prev, data: nuevaLista };
    });
  };

  const cambiarPagina = (pagina) => {
    setPaginaActual(pagina);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    setCondicionFiltro("");
    setCategoriaFiltro("");
    setPaginaActual(1);
    setPanelFiltro(false);
  };

  const aplicarOrden = (valor) => {
    setOrdenFiltro(valor);
    setPaginaActual(1);
    setPanelOrden(false);
  };

  const hayFiltrosActivos = condicionFiltro || categoriaFiltro;

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
        <div className="d-flex gap-2" style={{ position: "relative" }}>

          {/* Botón Filtrar */}
          <div ref={refFiltro} style={{ position: "relative" }}>
            <button
              className="tabla-icono-btn"
              title="Filtrar"
              onClick={() => { setPanelFiltro((v) => !v); setPanelOrden(false); }}
              style={hayFiltrosActivos ? { borderColor: "#1a3a6b", color: "#1a3a6b" } : {}}
            >
              <i className="bi bi-filter" />
              {hayFiltrosActivos && (
                <span style={{
                  position: "absolute", top: -5, right: -5,
                  background: "#1a3a6b", color: "white",
                  borderRadius: "50%", width: 14, height: 14,
                  fontSize: 9, display: "flex", alignItems: "center", justifyContent: "center"
                }}>!</span>
              )}
            </button>

            {panelFiltro && (
              <div style={{
  position: "absolute", right: 0, top: "110%", zIndex: 100,
  background: "white", border: "1px solid #e5e7eb", borderRadius: 10,
  boxShadow: "0 4px 16px rgba(0,0,0,0.1)", padding: "16px", minWidth: 220,
  maxHeight: "70vh", overflowY: "auto"
}}>
                <p style={{ fontWeight: 600, marginBottom: 10, fontSize: 13, color: "#374151" }}>
                  Filtrar por condición
                </p>
                {CONDICIONES.map((c) => (
                  <label key={c} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, cursor: "pointer", fontSize: 13 }}>
                    <input
                      type="radio"
                      name="condicion"
                      value={c}
                      checked={condicionFiltro === c}
                      onChange={() => { setCondicionFiltro(c); setPaginaActual(1); }}
                    />
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </label>
                ))}

                <hr style={{ margin: "10px 0", borderColor: "#e5e7eb" }} />

                <p style={{ fontWeight: 600, marginBottom: 10, fontSize: 13, color: "#374151" }}>
                  Filtrar por categoría
                </p>
                {CATEGORIAS.map((cat) => (
                  <label key={cat} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, cursor: "pointer", fontSize: 13 }}>
                    <input
                      type="radio"
                      name="categoria"
                      value={cat}
                      checked={categoriaFiltro === cat}
                      onChange={() => { setCategoriaFiltro(cat); setPaginaActual(1); }}
                    />
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </label>
                ))}

                <hr style={{ margin: "10px 0", borderColor: "#e5e7eb" }} />
                <button
                  onClick={limpiarFiltros}
                  style={{
                    width: "100%", padding: "6px 0", background: "transparent",
                    border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 12,
                    color: "#6b7280", cursor: "pointer"
                  }}
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>

          {/* Botón Ordenar */}
          <div ref={refOrden} style={{ position: "relative" }}>
            <button
              className="tabla-icono-btn"
              title="Ordenar"
              onClick={() => { setPanelOrden((v) => !v); setPanelFiltro(false); }}
              style={ordenFiltro ? { borderColor: "#1a3a6b", color: "#1a3a6b" } : {}}
            >
              <i className="bi bi-sort-down" />
            </button>

            {panelOrden && (
              <div style={{
                position: "absolute", right: 0, top: "110%", zIndex: 100,
                background: "white", border: "1px solid #e5e7eb", borderRadius: 10,
                boxShadow: "0 4px 16px rgba(0,0,0,0.1)", padding: "16px", minWidth: 200
              }}>
                <p style={{ fontWeight: 600, marginBottom: 10, fontSize: 13, color: "#374151" }}>
                  Ordenar por precio
                </p>
                {ORDENES.map((o) => (
                  <label key={o.value} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, cursor: "pointer", fontSize: 13 }}>
                    <input
                      type="radio"
                      name="orden"
                      value={o.value}
                      checked={ordenFiltro === o.value}
                      onChange={() => aplicarOrden(o.value)}
                    />
                    {o.label}
                  </label>
                ))}
                <hr style={{ margin: "10px 0", borderColor: "#e5e7eb" }} />
                <button
                  onClick={() => { setOrdenFiltro(""); setPaginaActual(1); setPanelOrden(false); }}
                  style={{
                    width: "100%", padding: "6px 0", background: "transparent",
                    border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 12,
                    color: "#6b7280", cursor: "pointer"
                  }}
                >
                  Sin orden
                </button>
              </div>
            )}
          </div>

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
      {isLoading || !productos ? (
        <SkeletonFilaProducto cantidad={3} />
      ) : productos?.data?.length === 0 ? (
        <div style={{ padding: "32px", textAlign: "center", color: "#6b7280", fontSize: 14 }}>
          No hay productos que coincidan con los filtros seleccionados.
        </div>
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
        onCancelar={() => { setModalEliminar(false); setProductoAEliminar(null); }}
      />

      <ModalEditarProducto
        isOpen={modalEditar}
        producto={productoAEditar}
        onClose={() => { setModalEditar(false); setProductoAEditar(null); }}
        onProductoActualizado={actualizarProductoEnLista}
      />
    </div>
  );
};

export default TablaProductos;