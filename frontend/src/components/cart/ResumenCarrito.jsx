import React from "react";
import { BtnAccion } from "../common/BtnAccion";
import { Link } from "react-router-dom";
 

export default function ResumenCarrito({ subtotal, cantidadItems, onProcesar, isProcessing = false }) {
  const subtotalFormateado = subtotal.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
 
  return (
    <div className="resumen-card">
      <h3 className="resumen-title">Resumen</h3>
 
      {/* Filas de detalle */}
      <div>
        <div className="resumen-fila">
          <span className="resumen-label">
            Subtotal ({cantidadItems} {cantidadItems === 1 ? "producto" : "productos"})
          </span>
          <span className="resumen-valor">${subtotalFormateado}</span>
        </div>
 
        <div className="resumen-fila">
          <span className="resumen-label">Envío</span>
          <span className="resumen-envio-badge">
            <i className="bi bi-check-lg" />
            GRATIS
          </span>
        </div>
      </div>
 
      {/* Total */}
      <div className="resumen-total-row">
        <span className="resumen-total-label">Total</span>
        <span className="resumen-total-valor">${subtotalFormateado}</span>
      </div>
 
      {/* Botón procesar pago — usa BtnAccion */}
      <BtnAccion
        textoDefault="Continuar con el Pago"
        iconoDefault="bi-lock-fill"
        textoCargando="Procesando…"
        isLoading={isProcessing}
        isFullWidth={true}
        colorDefault="btn-primary"
        onClick={onProcesar}
      />
 
      <Link
        className="btn btn-link w-100 text-secondary p-0"
        style={{ fontSize: "0.8125rem", textDecoration: "none" }}
        to="/catalogo"
        onClick={() => window.scroll({top:0,behavior: 'smooth'})}
      >
        ← Seguir comprando
      </Link>
 
      {/* Garantías */}
      <div className="garantias-list">
        <div className="garantia-item">
          <div className="garantia-icon">
            <i className="bi bi-shield-check" />
          </div>
          <span>Pago seguro y encriptado</span>
        </div>
        <div className="garantia-item">
          <div className="garantia-icon">
            <i className="bi bi-arrow-counterclockwise" />
          </div>
          <span>30 días de devolución</span>
        </div>
        <div className="garantia-item">
          <div className="garantia-icon">
            <i className="bi bi-star" />
          </div>
          <span>2 años de garantía oficial</span>
        </div>
      </div>
    </div>
  );
}