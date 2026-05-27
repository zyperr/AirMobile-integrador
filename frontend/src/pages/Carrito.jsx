import { useContext } from "react";
import { CarritoContext } from "../context/CarritoContext";
import "../style/carrito.css";

export default function Carrito() {

  const {
    cartItems: carrito,
    removeFromCart: eliminarDelCarrito,
    increaseQuantity: aumentarCantidad,
    decreaseQuantity: disminuirCantidad,
    subtotal
  } = useContext(CarritoContext);

  return (

    <div className="carrito-container container py-5">

      <h1 className="carrito-title fw-bold mb-5">
        Tu Carrito
      </h1>

      {carrito.length === 0 ? (

        <h4>
          Tu carrito está vacío
        </h4>

      ) : (

        <div className="row">

          {/* PRODUCTOS */}
          <div className="col-lg-8">

            {carrito.map((item) => (

              <div
                key={item.id}
                className="carrito-card"
              >

                <div className="carrito-card-body">

                  {/* IMAGEN */}
                  <img
                    src={item.imagen}
                    alt={item.nombreDeProducto}
                    className="carrito-img"
                  />

                  {/* INFO */}
                  <div className="carrito-info">

                    <h4 className="fw-bold">
                      {item.nombreDeProducto}
                    </h4>

                    <p className="text-secondary mb-2">
                      {item.capacidad}
                    </p>

                    {/* CANTIDAD */}
                    <div className="subtotal-row">

                      <button
                        className="btn btn-light"
                        onClick={() =>
                          disminuirCantidad(item.id)
                        }
                      >
                        -
                      </button>

                      <span className="fw-bold">
                        {item.quantity}
                      </span>

                      <button
                        className="btn btn-light"
                        onClick={() =>
                          aumentarCantidad(item.id)
                        }
                      >
                        +
                      </button>

                    </div>

                    {/* ELIMINAR */}
                    <button
                      className="btn btn-link text-danger p-0 mt-3"
                      onClick={() =>
                        eliminarDelCarrito(item.id)
                      }
                    >
                      Eliminar
                    </button>

                  </div>

                  {/* PRECIO */}
                  <h3 className="fw-bold">

                    $
                    {(
                      item.precio *
                      item.quantity
                    ).toFixed(2)}

                  </h3>

                </div>

              </div>

            ))}

          </div>

          {/* RESUMEN */}
          <div className="col-lg-4">

            <div className="card border-0 shadow-sm p-4">

              <h3 className="fw-bold mb-4">
                Resumen
              </h3>

              <div className="d-flex justify-content-between mb-3">

                <span>
                  Subtotal
                </span>

                <span className="fw-bold">
                  ${subtotal.toFixed(2)}
                </span>

              </div>

              <button className="checkout-btn">

                Procesar Pago

              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}