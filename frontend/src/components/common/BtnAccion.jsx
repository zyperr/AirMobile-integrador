import React from 'react';

export const BtnAccion = ({ 
    activo = false,           
    isLoading = false,        // NUEVO: Estado de carga
    onClick,                  
    textoDefault = "Añadir al carrito", 
    textoActivo = "¡Agregado!", 
    textoCargando = "Cargando...", // NUEVO: Texto de carga
    iconoDefault = "bi-cart-plus", 
    iconoActivo = "bi-check-lg",
    colorDefault = "btn-primary",
    colorActivo = "btn-success",
    className = "",           // NUEVO: Clases adicionales
    isFullWidth = true,       // NUEVO: Controla si ocupa el 100% (true para carrito, false para modales)
    disabled,
    ...rest                   
}) => {
    // Si isFullWidth es true, le damos el estilo gigante original. Si no, solo lo básico.
    const sizeClasses = isFullWidth ? "w-100 py-3 mb-3" : "";
    const colorClass = activo ? colorActivo : colorDefault;
    
    // El botón se desactiva si se pasa la prop disabled, si está activo, o si está cargando
    const disabledState = disabled || activo || isLoading;

    return (
        <button
            {...rest}
            onClick={onClick}
            className={`btn fw-semibold rounded-3 ${sizeClasses} ${colorClass} ${className}`}
            disabled={disabledState}
            style={{ fontSize: "1rem", transition: "background 0.3s" }}
        >
            {/* LÓGICA DE RENDERIZADO (Prioridad: Cargando > Activo > Default) */}
            {isLoading ? (
                <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    {textoCargando}
                </>
            ) : activo ? (
                <>
                    {iconoActivo && <i className={`bi ${iconoActivo} me-2`} />}
                    {textoActivo}
                </>
            ) : (
                <>
                    {iconoDefault && <i className={`bi ${iconoDefault} me-2`} />}
                    {textoDefault}
                </>
            )}
        </button>
    );
};