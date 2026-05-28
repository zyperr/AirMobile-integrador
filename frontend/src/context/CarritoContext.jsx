import { createContext, useEffect, useState } from "react";

export const CarritoContext = createContext();

export function CartProvider({ children }) {

  const [cartItems, setCartItems] = useState(() => {

  const carritoGuardado =
    localStorage.getItem("carrito");

  return carritoGuardado
    ? JSON.parse(carritoGuardado)
    : [];

});
useEffect(() => {

  localStorage.setItem(
    "carrito",
    JSON.stringify(cartItems)
  );

}, [cartItems]);

  const addToCart = (product) => {

    const existingProduct = cartItems.find(
      (item) => item.id === product.id
    );

    if (existingProduct) {

      setCartItems(
        cartItems.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1
              }
            : item
        )
      );

    } else {

      setCartItems([
        ...cartItems,
        {
          ...product,
          quantity: 1
        }
      ]);

    }

  };

  const removeFromCart = (id) => {

    setCartItems(
      cartItems.filter((item) => item.id !== id)
    );

  };

  const increaseQuantity = (id) => {

    setCartItems(
      cartItems.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: item.quantity + 1
            }
          : item
      )
    );

  };

  const decreaseQuantity = (id) => {

    setCartItems(
      cartItems.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity:
                item.quantity > 1
                  ? item.quantity - 1
                  : 1
            }
          : item
      )
    );

  };

  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
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
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        cartCount,
        subtotal
      }}
    >

      {children}

    </CarritoContext.Provider>

  );

}