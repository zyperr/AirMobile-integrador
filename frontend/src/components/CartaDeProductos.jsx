import { Link } from 'react-router-dom';
import '../style/CartaDeProductos.css';

const ProductCard = ({ id,nombreDeProducto, condicion, precio, capacidad = [], imagen_url }) => {
  // Validación por si capacidad viene como texto (string) desde la base de datos
  const capacidadFormateada = Array.isArray(capacidad) ? capacidad.join(', ') : capacidad;
  
  return (
    <div className="card border-0 h-100 custom-product-card shadow-sm d-flex flex-column">
      <Link className='text-decoration-none' to={`/producto/${id}`}>
        {/* Contenedor de imagen */}
        <div className="custom-img-container position-relative text-center">
          <img
            src={imagen_url[0]}
            alt={`Imagen de ${nombreDeProducto}`}
            className="custom-product-img"
          />
        </div>

        {/* Contenedor de detalles */}
        <div className="card-body p-3 d-flex flex-column flex-grow-1">

          <div className="d-flex flex-column align-items-start mb-2">
            <h2
              className="card-title m-0 fw-bold text-dark text-start mb-2"
              style={{
                fontSize: "16px",
                lineHeight: "1.3",
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {nombreDeProducto}
            </h2>

            <span className="badge rounded-pill custom-status-badge">
              {condicion?.toUpperCase()}
            </span>
          </div>

          {/* Descripción */}
          <div className="text-secondary mb-3 text-start" style={{ fontSize: "14px" }}>
            Natural Titanium <span className="custom-bullet mx-1">•</span> {capacidadFormateada || "N/A"}
          </div>

          {/* ========================================== */}
          {/* PRECIO Y BOTÓN (AQUÍ ESTÁ LA MAGIA CORREGIDA) */}
          {/* ========================================== */}
          {/* Agregamos gap-2 por seguridad */}
          <div className="d-flex justify-content-between align-items-center mt-auto pt-3 border-top gap-2">

            {/* Le bajamos el tamaño con fs-5 (o puedes usar style={{ fontSize: "18px" }}) */}
            <span className="fw-bold text-dark fs-5 text-truncate" title={`$${precio}`}>
              ${precio}
            </span>

            {/* Agregamos text-nowrap y ajustamos el padding (px-2 py-1) */}
            <button  className="btn btn-primary fw-semibold custom-view-btn btn-sm text-nowrap px-2 py-1">
              View Details
            </button>

          </div>

        </div>
      </Link>

    </div>
  );
};

export default ProductCard;