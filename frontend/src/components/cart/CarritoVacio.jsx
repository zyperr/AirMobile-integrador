import React from "react";
import { Link } from "react-router-dom";


export default function CarritoVacio( ) {
  return (
    <div className="carrito-empty">
      <div className="carrito-empty-icon">
        <i className="bi bi-cart3" />
      </div>
      <h4>Tu carrito está vacío</h4>
      <p>Explorá nuestros productos y encontrá lo que buscás.</p>
      <Link
        className="btn btn-primary px-4 py-2 rounded-3 fw-semibold"
        to="/catalogo"
      >
        <i className="bi bi-bag me-2" />
        Ver productos
      </Link>
    </div>
  );
}