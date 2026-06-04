import { useContext } from "react";
import { CarritoContext } from "../context/CarritoContext";
import "../style/carrito.css";
//temporales

import { useEffect,useState } from "react";
import { useApi } from "../hooks/useApi";
import { useAuth } from "../context/AuthContext";


export default function Carrito() {

  const {
    removeFromCart: eliminarDelCarrito,
    increaseQuantity: aumentarCantidad,
    decreaseQuantity: disminuirCantidad,
  } = useContext(CarritoContext);

  //temporal
  const { ejecutarPeticion } = useApi();
  const { token } = useAuth();
  console.log("TOKEN:", token);
  const [carrito, setCarrito] = useState([]);
  const cargarCarrito = async () => {

  const resultado = await ejecutarPeticion(
    "carrito",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (resultado?.data?.data) {

    const carritoFormateado = resultado.data.data.map(item => ({
      id: item.producto_id,
      carritoId: item.carrito_id,
      nombreDeProducto: item.nombre_producto,
      quantity: item.cantidad,
      precio: item.precio,
      imagen: JSON.parse(item.imagen_url)[0]
    }));

    setCarrito(carritoFormateado);
  }
};

const aumentarCantidadApi = async (id) => {

  await ejecutarPeticion(
    `carrito/agregar-carrito/${id}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        cantidad: 1
      })
    }
  );

  await cargarCarrito();
};

const disminuirCantidadApi = async (id) => {

  await ejecutarPeticion(
    `carrito/eliminar-carrito/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  await cargarCarrito();
};

const eliminarProductoApi = async (id) => {

  await ejecutarPeticion(
    `carrito/eliminar-producto-completo/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  await cargarCarrito();
};


   useEffect(() => {  

  cargarCarrito();

  }, [token]);
    console.log("carrito actual:", carrito);

    const subtotalApi = carrito.reduce(
      (total, item) =>
        total + item.precio * item.quantity,
       0
    );

  

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
                          disminuirCantidadApi(item.id)
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
                          aumentarCantidadApi(item.id)
                        }
                      >
                        +
                      </button>

                    </div>

                    {/* ELIMINAR */}
                    <button
                      className="btn btn-link text-danger p-0 mt-3"
                      onClick={() =>
                        eliminarProductoApi(item.id)
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
                  ${subtotalApi.toFixed(2)}
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