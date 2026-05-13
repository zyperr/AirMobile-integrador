import '../style/CartaDeProductos.css';
import phoneImage from '../../public/img/iPhone 12 Pro.png'; 

const ProductCard = ({ nombreDeProducto, condicion, precio, capacidad = [] }) => {
  // Validación por si capacidad viene como texto (string) desde la base de datos
  const capacidadFormateada = Array.isArray(capacidad) ? capacidad.join(', ') : capacidad;

  return (
    
    <div className="card border-0 h-60 custom-product-card shadow-sm d-flex flex-column">
      {/* card de Bootstrap con flex-column para empujar el botón hacia abajo */}
      {/* Contenedor de imagen */}
      <div className="custom-img-container position-relative">
        <img 
          src={phoneImage} 
          alt={`Imagen de ${nombreDeProducto}`} 
          className="custom-product-img" 
        />
      </div>

      {/* Contenedor de detalles (card-body) */}
      <div className="card-body p-1 d-flex flex-column flex-grow-1">
        
        {/* Título y Badge */}
        <div className="d-flex justify-content-between align-items-center mb-1">
          <h2 className="card-title m-0 fw-bold text-dark fs-5">{nombreDeProducto}</h2>
          <span className="badge rounded-pill custom-status-badge">
            {condicion?.toUpperCase()}
          </span>
        </div>

        {/* Descripción */}
        <div className="text-secondary mb-4" style={{ fontSize: "15px" }}>
          Natural Titanium <span className="custom-bullet">•</span> {capacidadFormateada}
        </div>

        {/* Precio y Botón (mt-auto los empuja al final siempre) */}
        <div className="d-flex justify-content-between align-items-center mt-auto pt-2">
          <span className="fw-bold text-dark fs-4">${precio}</span>
          <button className="btn btn-primary fw-semibold custom-view-btn">
            View Details
          </button>
        </div>
        
      </div>
    </div>
  );
};

export default ProductCard;