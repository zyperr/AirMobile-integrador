import React from 'react';

export const BtnAccion = ({ 
    activo = false,           // Equivale a tu "added"
    onClick,                  // Equivale a tu "handleAdd"
    textoDefault = "Añadir al carrito", 
    textoActivo = "¡Agregado!", 
    iconoDefault = "bi-cart-plus", 
    iconoActivo = "bi-check-lg",
    colorDefault = "btn-primary",
    colorActivo = "btn-success",
    ...rest                   // Recibe disabled, type, etc.
}) => {
    return (
        <button
            {...rest}
            onClick={onClick}
            className={`btn w-100 py-3 fw-semibold rounded-3 mb-3 ${activo ? colorActivo : colorDefault}`}
            style={{ fontSize: "1rem", transition: "background 0.3s" }}
        >
            {activo ? (
                <>
                    <i className={`bi ${iconoActivo} me-2`} />
                    {textoActivo}
                </>
            ) : (
                <>
                    <i className={`bi ${iconoDefault} me-2`} />
                    {textoDefault}
                </>
            )}
        </button>
    );
};