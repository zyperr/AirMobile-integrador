import { createContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

export const CarritoContext = createContext();

export function CartProvider({ children }) {

  const { token, estaAutenticado } = useAuth();

  const [cartItems, setCartItems] = useState([]);

  const cargarCarrito = async () => {

    if (!token) {
      setCartItems([]);
      return;
    }

    try {

      const response = await fetch(
        "http://localhost:3000/api/carrito",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const resultado = await response.json();

      if (resultado?.data) {

        const carritoFormateado =
          resultado.data.map(item => ({
            id: item.producto_id,
            carritoId: item.carrito_id,
            nombreDeProducto: item.nombre_producto,
            quantity: item.cantidad,
            precio: item.precio,
            imagen: JSON.parse(item.imagen_url)[0]
          }));

        setCartItems(carritoFormateado);

      }

    } catch (error) {

      console.error(
        "Error cargando carrito:",
        error
      );

    }

  };

  useEffect(() => {

    if (estaAutenticado) {
      cargarCarrito();
    } else {
      setCartItems([]);
    }

  }, [token]);

  const agregarProducto = async (idProducto) => {

    await fetch(
      `http://localhost:3000/api/carrito/agregar-carrito/${idProducto}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          cantidad: 1
        })
      }
    );

    await cargarCarrito();

  };

  const increaseQuantity = async (idProducto) => {

    await agregarProducto(idProducto);

  };

  const decreaseQuantity = async (idProducto) => {

    await fetch(
      `http://localhost:3000/api/carrito/eliminar-carrito/${idProducto}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    await cargarCarrito();

  };

  const removeFromCart = async (idProducto) => {

    await fetch(
      `http://localhost:3000/api/carrito/eliminar-producto-completo/${idProducto}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    await cargarCarrito();

  };

  const cartCount = cartItems.reduce(
    (total, item) =>
      total + item.quantity,
    0
  );

  const subtotal = cartItems.reduce(
    (total, item) =>
      total + item.precio * item.quantity,
    0
  );

  return (
    <CarritoContext.Provider
      value={{
        cartItems,
        cartCount,
        subtotal,
        cargarCarrito,
        agregarProducto,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart
      }}
    >
      {children}
    </CarritoContext.Provider>
  );
}