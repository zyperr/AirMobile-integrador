import { Link } from 'react-router-dom';
import { useContext } from 'react';
import '../../style/CartaDeProductos.css';
import { CarritoContext } from '../../context/CarritoContext';
import BotonDeseados from '../productos/BotonDeseados'; // Asegúrate de que la ruta sea la correcta
import { useAuth } from '../../context/AuthContext'; // Importamos el hook para acceder al estado de autenticación


const ProductCard = ({
  id,
  nombreDeProducto,
  condicion,
  precio,
  capacidad = [],
  imagen_url,
  onRemover
}) => {

  const { agregarProducto } = useContext(CarritoContext);

  const capacidadFormateada =
    Array.isArray(capacidad)
      ? capacidad.join(', ')
      : capacidad;

  const { estaAutenticado } = useAuth();

  return (
    // Agregamos 'position-relative' aquí para que el botón flote relativo a la tarjeta
    <div className="card border-0 h-100 custom-product-card shadow-sm d-flex flex-column position-relative">

      {/* BOTÓN DE FAVORITOS
        Debe ir FUERA del <Link> para evitar que el clic nos lleve a otra página.
        Como nuestro BotonDeseos tiene position-absolute, se pondrá en la esquina sin empujar nada.
      */}


      {estaAutenticado && (
        <BotonDeseados idProducto={id} onRemover={onRemover} />
      )}

      {/* Todo lo demás envuelto en el Link, como lo tenías */}
      <Link className='text-decoration-none text-dark flex-grow-1 d-flex flex-column' to={`/producto/${id}`}>

        {/* Contenedor de imagen */}
        <div className="custom-img-container position-relative text-center mt-3">
          <img
            src={imagen_url[0]}
            alt={`Imagen de ${nombreDeProducto}`}
            className="custom-product-img"
          />
        </div>

        {/* Contenedor de detalles */}
        <div className="card-body p-3 d-flex flex-column flex-grow-1">

          <div className="d-flex flex-column align-items-start mb-2 mt-2">
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
            
            <span className="custom-bullet mx-1">•</span> {capacidadFormateada || "N/A"}
          </div>

          {/* ========================================== */}
          {/* PRECIO Y BOTÓN */}
          {/* ========================================== */}
          <div className="d-flex justify-content-between align-items-center mt-auto pt-3 border-top gap-2">

            <span className="fw-bold text-dark fs-5 text-truncate" title={`$${precio}`}>
              ${Number(precio).toFixed(2)}
            </span>

            {/* Agregamos text-nowrap y ajustamos el padding (px-2 py-1) */}
            {estaAutenticado && (
              <button
                className="btn btn-primary fw-semibold custom-view-btn btn-sm text-nowrap px-2 py-1"
                onClick={async (e) => {

                  e.preventDefault();
                  /*
                  addToCart({
                    id,
                    nombreDeProducto,
                    precio,
                    imagen: imagen_url[0],
                    condicion,
                    capacidad: capacidadFormateada
                  });
                  */

                  await agregarProducto(id);
                }}
              >
                Añadir
              </button>
            )}
          </div >

        </div >
      </Link >

    </div >
  );
};

export default ProductCard;