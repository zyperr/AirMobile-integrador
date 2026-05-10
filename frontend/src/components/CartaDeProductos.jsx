import '../style/CartaDeProductos.css'; // Importa el archivo CSS con los estilos

// Puedes reemplazar esta URL con la ruta a tu propia imagen del iPhone 15 Pro
import phoneImage from '../../public/img/iPhone 12 Pro.png'; // Asegúrate de tener una imagen similar en tu carpeta

const ProductCard = ({nombreDeProducto, condicion, precio, capacidad = []}) => {
  return (
    <div className="product-card">
      {/* Sección de la imagen con el contenedor gris claro */}
      <div className="image-container">
        <img 
          src={phoneImage} 
          alt="iPhone 15 Pro en color Natural Titanium" 
          className="product-image" 
        />
      </div>

      {/* Sección de detalles del producto */}
      <div className="details-container">
        {/* Fila del título y la etiqueta de estado */}
        <div className="title-row">
          <h2 className="product-title">{nombreDeProducto}</h2>
          <span className="status-badge">{condicion.toUpperCase()}</span>
        </div>

        {/* Fila de descripción */}
        <div className="product-description">
          Natural Titanium <span className="bullet-separator">•</span> {capacidad.join(', ')}
        </div>

        {/* Fila de precio y botón de acción */}
        <div className="action-row">
          <span className="product-price">${precio}</span>
          <button className="view-details-button">View Details</button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;