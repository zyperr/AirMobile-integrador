import { useCarrito } from "../context/CarritoContext";
import CarritoItem from "../components/cart/CarritoItem";
import { useState } from "react";
import "../style/carrito.css";
import CarritoVacio from "../components/cart/CarritoVacio";
import ResumenCarrito from "../components/cart/ResumenCarrito";
export default function Carrito() {
  const {
    cartItems: carrito,
    subtotal,
    loadingId,
    increaseQuantity: aumentarCantidad,
    decreaseQuantity: disminuirCantidad,
    removeFromCart: eliminarProducto,
    cartCount: cantidadItems,
    procesarPago,
    isProcessing
  } = useCarrito();
  console.log(carrito)
  return (
    <div className="carrito-container container py-5">

      {/* Header */}
      <div className="mb-4">
        <h1 className="carrito-title">Tu Carrito.</h1>
        {carrito.length > 0 && (
          <p className="carrito-subtitle">
            {cantidadItems} {cantidadItems === 1 ? "producto" : "productos"} en tu carrito
          </p>
        )}
      </div>

      {carrito.length === 0 ? (
        <CarritoVacio />
      ) : (
        <div className="row g-4 align-items-start">

          {/* ── Lista de productos ── */}
          <div className="col-lg-8">
            {carrito.map((item, i) => (
              <div key={item.id} style={{ animationDelay: `${i * 60}ms` }}>
                <CarritoItem
                  item={item}
                  onAumentar={aumentarCantidad}
                  onDisminuir={disminuirCantidad}
                  onEliminar={eliminarProducto}
                  loadingId={loadingId}
                />
              </div>
            ))}
          </div>

          {/* ── Panel resumen ── */}
          <div className="col-lg-4">
            <ResumenCarrito
              subtotal={subtotal}
              cantidadItems={cantidadItems}
              onProcesar={procesarPago}
              isProcessing={isProcessing}
            />
          </div>

        </div>
      )}

    </div>
  );

}