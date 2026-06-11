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
 
        {/* Imagen */}
        <div className="carrito-img-wrap">
          <img
            src={item.imagen}
            alt={item.nombre_producto}
            className="carrito-img"
          />
        </div>
 
        {/* Info */}
        <div className="carrito-info">
          <p className="carrito-nombre">{item.nombre_producto}</p>
          {item.capacidad && (
            <p className="carrito-capacidad">{item.capacidad}</p>
          )}
 
          {/* Control de cantidad */}
          <div className="cantidad-control">
            <button
              className="cantidad-btn"
              onClick={() => onDisminuir(item.id)}
              disabled={isLoading || item.cantidad <= 1}
              aria-label="Disminuir cantidad"
            >
              {isLoading ? (
                <span
                  className="spinner-border spinner-border-sm"
                  style={{ width: "12px", height: "12px" }}
                  role="status"
                  aria-hidden="true"
                />
              ) : (
                <i className="bi bi-dash" />
              )}
            </button>
 
            <div className="cantidad-sep" />
            <span className="cantidad-num">{item.cantidad}</span>
            <div className="cantidad-sep" />
 
            <button
              className="cantidad-btn"
              onClick={() => onAumentar(item.id)}
              disabled={isLoading}
              aria-label="Aumentar cantidad"
            >
                            {isLoading ? (
                <span
                  className="spinner-border spinner-border-sm"
                  style={{ width: "12px", height: "12px" }}
                  role="status"
                  aria-hidden="true"
                />
              ) : (
                <i className="bi bi-plus" />
              )}
            </button>
          </div>
 
          {/* Eliminar */}
          <button
            className="btn-eliminar"
            onClick={() => onEliminar(item.id)}
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