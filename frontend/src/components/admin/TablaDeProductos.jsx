import { useState, useEffect, useRef } from "react";
import { useApi } from "../../hooks/useApi";
import { useAuth } from "../../context/AuthContext";
import Paginacion from "../common/Paginacion";
import { SkeletonFilaProducto } from "./SkeletonFilaLoader";
import { ProductosFila } from "./ProductoFila";
import ModalConfirmarEliminar from "./forms/ModalConfirmarEliminar";
import ModalEditarProducto from "./forms/ModalEditarProducto";

const CONDICIONES = ["nuevo", "usado", "reacondicionado"];
const CATEGORIAS = ["celulares", "tablets", "relojes", "auriculares", "cargadores", "cables", "powerbanks", "fundas", "protectores", "accesorios"];
const ORDENES = [
  { label: "Más recientes primero", value: "desc" },
  { label: "Más antiguos primero", value: "asc" },
];

const inputStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 6,
  padding: "5px 8px",
  fontSize: 12,
  background: "white",
  color: "#374151",
  outline: "none",
};

const TablaProductos = () => {
  const [paginaActual, setPaginaActual] = useState(1);
  const { token } = useAuth();
  const { ejecutarPeticion, isLoading, error } = useApi();
  const [productos, setProductos] = useState([]);

  const [busqueda, setBusqueda] = useState("");
  const [busquedaInput, setBusquedaInput] = useState("");
  const [condicionFiltro, setCondicionFiltro] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [ordenFiltro, setOrdenFiltro] = useState("");
  const [precioMin, setPrecioMin] = useState("");
  const [precioMax, setPrecioMax] = useState("");
  const [precioMinInput, setPrecioMinInput] = useState("");
  const [precioMaxInput, setPrecioMaxInput] = useState("");
  const [errorPrecio, setErrorPrecio] = useState("");

  const [panelFiltro, setPanelFiltro] = useState(false);
  const [panelOrden, setPanelOrden] = useState(false);

  const refFiltro = useRef(null);
  const refOrden = useRef(null);

  const [modalEliminar, setModalEliminar] = useState(false);
  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [modalEditar, setModalEditar] = useState(false);
  const [productoAEditar, setProductoAEditar] = useState(null);

  useEffect(() => {
    const handleClickAfuera = (e) => {
      if (refFiltro.current && !refFiltro.current.contains(e.target)) setPanelFiltro(false);
      if (refOrden.current && !refOrden.current.contains(e.target)) setPanelOrden(false);
    };
    document.addEventListener("mousedown", handleClickAfuera);
    return () => document.removeEventListener("mousedown", handleClickAfuera);
  }, []);

  useEffect(() => {
    const cargarProductos = async () => {
      const params = new URLSearchParams();
      params.set("limit", "3");
      params.set("page", paginaActual);
      if (condicionFiltro) params.set("condicion", condicionFiltro);
      if (categoriaFiltro) params.set("categoria", categoriaFiltro);
      if (ordenFiltro) params.set("orden", ordenFiltro);
      if (busqueda) params.set("busqueda", busqueda);
      if (precioMin) params.set("precioMin", precioMin);
      if (precioMax) params.set("precioMax", precioMax);

      const respuesta = await ejecutarPeticion(`productos/todos?${params.toString()}`, { method: "GET" });
      if (respuesta.exito) setProductos(respuesta.data);
    };
    cargarProductos();
  }, [paginaActual, condicionFiltro, categoriaFiltro, ordenFiltro, busqueda, precioMin, precioMax]);

  const restaurarProducto = async (id) => {
    const result = await ejecutarPeticion(`productos/restaurar-producto/${id}`, { method: "PUT" });
    if (result.exito) {
      setProductos((prev) => ({
        ...prev,
        data: prev.data.map((p) => (p.id === id ? { ...p, activo: 1 } : p)),
      }));
    } else {
      alert("No se pudo restaurar el producto. Intentá de nuevo.");
    }
  };

  const abrirModalEliminar = (id, nombre) => {
    setProductoAEliminar({ id, nombre });
    setModalEliminar(true);
  };

const confirmarEliminar = async () => {
    const result = await ejecutarPeticion(`productos/eliminar-producto/${productoAEliminar.id}`, {
      method: "DELETE",
    });
    if (result.exito) {
      setProductos((prev) => ({
        ...prev,
        data: prev.data.map((p) => (p.id === productoAEliminar.id ? { ...p, activo: 0 } : p)),
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
      const nuevaLista = listaOriginal.map((p) => (p.id == id ? { ...p, ...datosActualizados } : p));
      return esArrayDirecto ? nuevaLista : { ...prev, data: nuevaLista };
    });
  };

  const cambiarPagina = (pagina) => {
    setPaginaActual(pagina);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const limpiarFiltros = () => {
    setCondicionFiltro("");
    setCategoriaFiltro("");
    setPrecioMin("");
    setPrecioMax("");
    setPrecioMinInput("");
    setPrecioMaxInput("");
    setErrorPrecio("");
    setPaginaActual(1);
    setPanelFiltro(false);
  };

  const aplicarPrecios = () => {
    if (precioMinInput && precioMaxInput && Number(precioMinInput) > Number(precioMaxInput)) {
      setErrorPrecio("El precio mínimo no puede ser mayor al máximo.");
      return;
    }
    setErrorPrecio("");
    setPrecioMin(precioMinInput);
    setPrecioMax(precioMaxInput);
    setPaginaActual(1);
  };

  const hayFiltrosActivos = condicionFiltro || categoriaFiltro || precioMin || precioMax;

  if (error) {
    return <div className="tabla-card p-4"><p className="text-danger">Error al cargar productos: {error}</p></div>;
  }

  return (
    <div className="tabla-card">
      <div className="tabla-header d-flex align-items-center justify-content-between">
        <h2 className="tabla-titulo">Productos Activos</h2>
        <div className="d-flex gap-2 align-items-center">

          {/* Barra de búsqueda */}
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="Buscar producto..."
              value={busquedaInput}
              onChange={(e) => setBusquedaInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setBusqueda(busquedaInput);
                  setPaginaActual(1);
                }
              }}
              style={{
                ...inputStyle,
                borderRadius: 8,
                padding: "6px 36px 6px 12px",
                fontSize: 13,
                width: 200,
              }}
            />
            <button
              onClick={() => { setBusqueda(busquedaInput); setPaginaActual(1); }}
              style={{
                position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer", color: "#6b7280", padding: 0
              }}
            >
              <i className="bi bi-search" style={{ fontSize: 14 }} />
            </button>
          </div>

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
                  background: "#1a3a6b", color: "white", borderRadius: "50%",
                  width: 14, height: 14, fontSize: 9,
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>!</span>
              )}
            </button>

            {panelFiltro && (
              <div style={{
                position: "absolute", right: 0, top: "110%", zIndex: 100,
                background: "white", border: "1px solid #e5e7eb", borderRadius: 10,
                boxShadow: "0 4px 16px rgba(0,0,0,0.1)", padding: "16px", minWidth: 230,
                maxHeight: "70vh", overflowY: "auto"
              }}>

                {/* Rango de precio */}
                <p style={{ fontWeight: 600, marginBottom: 10, fontSize: 13, color: "#374151" }}>Rango de precio</p>
                <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                  <input
                    type="number"
                    placeholder="Mín"
                    value={precioMinInput}
                    onChange={(e) => { setPrecioMinInput(e.target.value); setErrorPrecio(""); }}
                    style={{ ...inputStyle, width: "50%" }}
                  />
                  <input
                    type="number"
                    placeholder="Máx"
                    value={precioMaxInput}
                    onChange={(e) => { setPrecioMaxInput(e.target.value); setErrorPrecio(""); }}
                    style={{ ...inputStyle, width: "50%" }}
                  />
                </div>
                {errorPrecio && (
                  <p style={{ color: "#ef4444", fontSize: 11, marginBottom: 6 }}>{errorPrecio}</p>
                )}
                <button
                  onClick={aplicarPrecios}
                  style={{
                    width: "100%", padding: "5px 0", background: "#1a3a6b", color: "white",
                    border: "none", borderRadius: 6, fontSize: 12, cursor: "pointer", marginBottom: 4
                  }}
                >
                  Aplicar precio
                </button>

                <hr style={{ margin: "10px 0", borderColor: "#e5e7eb" }} />

                {/* Condición */}
                <p style={{ fontWeight: 600, marginBottom: 10, fontSize: 13, color: "#374151" }}>Filtrar por condición</p>
                {CONDICIONES.map((c) => (
                  <label key={c} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, cursor: "pointer", fontSize: 13, color: "#374151" }}>
                    <input type="radio" name="condicion" value={c} checked={condicionFiltro === c}
                      onChange={() => { setCondicionFiltro(c); setPaginaActual(1); }} />
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </label>
                ))}

                <hr style={{ margin: "10px 0", borderColor: "#e5e7eb" }} />

                {/* Categoría */}
                <p style={{ fontWeight: 600, marginBottom: 10, fontSize: 13, color: "#374151" }}>Filtrar por categoría</p>
                {CATEGORIAS.map((cat) => (
                  <label key={cat} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, cursor: "pointer", fontSize: 13, color: "#374151" }}>
                    <input type="radio" name="categoria" value={cat} checked={categoriaFiltro === cat}
                      onChange={() => { setCategoriaFiltro(cat); setPaginaActual(1); }} />
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </label>
                ))}

                <hr style={{ margin: "10px 0", borderColor: "#e5e7eb" }} />
                <button onClick={limpiarFiltros} style={{
                  width: "100%", padding: "6px 0", background: "transparent",
                  border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 12, color: "#6b7280", cursor: "pointer"
                }}>Limpiar filtros</button>
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
                boxShadow: "0 4px 16px rgba(0,0,0,0.1)", padding: "16px", minWidth: 210
              }}>
                <p style={{ fontWeight: 600, marginBottom: 10, fontSize: 13, color: "#374151" }}>Ordenar por fecha</p>
                {ORDENES.map((o) => (
                  <label key={o.value} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, cursor: "pointer", fontSize: 13, color: "#374151" }}>
                    <input type="radio" name="orden" value={o.value} checked={ordenFiltro === o.value}
                      onChange={() => { setOrdenFiltro(o.value); setPaginaActual(1); setPanelOrden(false); }} />
                    {o.label}
                  </label>
                ))}
                <hr style={{ margin: "10px 0", borderColor: "#e5e7eb" }} />
                <button onClick={() => { setOrdenFiltro(""); setPaginaActual(1); setPanelOrden(false); }} style={{
                  width: "100%", padding: "6px 0", background: "transparent",
                  border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 12, color: "#6b7280", cursor: "pointer"
                }}>Sin orden</button>
              </div>
            )}
          </div>

        </div>
      </div>

      <div className="tabla-columnas d-flex">
        <span className="tabla-col-nombre">NOMBRE DEL PRODUCTO</span>
        <span className="tabla-col-estado">ESTADO</span>
        <span className="tabla-col-precio">PRECIO</span>
        <span className="tabla-col-acciones"></span>
      </div>

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
            activo={producto.activo}
            onEliminar={(id) => abrirModalEliminar(id, producto.nombre_producto)}
            onEditar={abrirModalEditar}
            onRestaurar={restaurarProducto}
          />
        ))
      )}

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