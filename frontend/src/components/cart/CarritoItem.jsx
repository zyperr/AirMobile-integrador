import { Link } from "react-router-dom"; // <-- NUEVO: Importamos Link

export default function CarritoItem({ item, onAumentar, onDisminuir, onEliminar, loadingId }) {

  const isLoading = loadingId === item.id;
  const precioTotal = (item.precio * item.cantidad).toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const precioUnit = item.precio.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="carrito-card">
      <div className="carrito-card-body">

        {/* Imagen con Link al detalle */}
        <div className="carrito-img-wrap">
          <Link to={`/producto/${item.id}`}>
            <img
              src={item.imagen}
              alt={item.nombre_producto}
              className="carrito-img"
              style={{ cursor: "pointer", transition: "transform 0.2s" }}
            />
          </Link>
        </div>

        {/* Info */}
        <div className="carrito-info">
          {/* Título con Link al detalle */}
          <Link to={`/producto/${item.id}`} className="text-decoration-none text-dark">
            <p className="carrito-nombre" style={{ cursor: "pointer" }}>
              {item.nombre_producto}
            </p>
          </Link>
          
          {item.capacidad && (
            <p className="carrito-capacidad">{item.capacidad}</p>
          )}

          {/* Control de cantidad */}
          <div className="cantidad-control">
            <button
              className="cantidad-btn"
              onClick={() => onDisminuir(item.id, item.capacidad)}
              disabled={isLoading || item.cantidad <= 1}
              aria-label="Disminuir cantidad"
            >
              {isLoading ? (
                <span className="spinner-border spinner-border-sm" style={{ width: "12px", height: "12px" }} role="status" aria-hidden="true" />
              ) : (
                <i className="bi bi-dash" />
              )}
            </button>

            <div className="cantidad-sep" />
            <span className="cantidad-num">{item.cantidad}</span>
            <div className="cantidad-sep" />

            <button
              className="cantidad-btn"
              onClick={() => onAumentar(item.id, item.capacidad)}
              disabled={isLoading}
              aria-label="Aumentar cantidad"
            >
              {isLoading ? (
                <span className="spinner-border spinner-border-sm" style={{ width: "12px", height: "12px" }} role="status" aria-hidden="true" />
              ) : (
                <i className="bi bi-plus" />
              )}
            </button>
          </div>

          {/* Eliminar */}
          <button
            className="btn-eliminar"
            onClick={() => onEliminar(item.id, item.capacidad)}
            disabled={isLoading}
          >
            <i className="bi bi-trash3" />
            Eliminar
          </button>
        </div>

        {/* Precio */}
        <div className="carrito-precio">
          <p className="carrito-precio-monto">${precioTotal}</p>
          {item.cantidad > 1 && (
            <p className="carrito-precio-unit">${precioUnit} c/u</p>
          )}
        </div>

      </div>
    </div>
  );
}