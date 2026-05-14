import '../style/CartaDeProductos.css';

const ProductCard = ({ nombreDeProducto, condicion, precio, capacidad = [], imagen_url }) => {
  const capacidadFormateada = Array.isArray(capacidad) ? capacidad.join(', ') : capacidad;

  return (
    <div className="card border-0 h-100 custom-product-card shadow-sm d-flex flex-column">
      
      <div className="custom-img-container position-relative text-center p-3">
        <img 
          src={imagen_url[0]} 
          alt={`Imagen de ${nombreDeProducto}`} 
          loading="lazy"
          className="custom-product-img img-fluid" 
        />
      </div>

      <div className="card-body p-4 d-flex flex-column flex-grow-1">
        
        <div className="d-flex flex-column align-items-start mb-3">
          <h2 
            className="card-title m-0 fw-bold text-dark text-start mb-2"
            style={{
              fontSize: "18px", // Subimos un pelín el título para que acompañe el nuevo tamaño de la tarjeta
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

        <div className="d-flex justify-content-between align-items-center mt-auto pt-3 border-top gap-2">
          
          
          <span className="fw-bolder text-dark fs-6 text-truncate" title={`$${precio}`}>
            ${precio}
          </span>
          
          
          <button 
            className="btn btn-outline-primary fw-semibold custom-view-btn btn-sm text-nowrap px-3 py-1" 
            style={{ fontSize: "12px" }}
          >
            Ver más
          </button>
          
        </div>
        
      </div>
    </div>
  );
};

export default ProductCard;