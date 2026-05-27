import React, { useState } from 'react';

export const DescripcionProducto = ({ descripcion }) => {
    // Estado para controlar si el texto está expandido o colapsado
    const [expandido, setExpandido] = useState(false);

    // Si el backend por algún motivo no manda descripción, no renderizamos nada
    if (!descripcion) return null;

    // Definimos a los cuántos caracteres queremos "cortar" el texto
    const limiteCaracteres = 150;
    const esTextoLargo = descripcion.length > limiteCaracteres;

    // Lógica para saber qué porción del texto mostrar
    const textoAMostrar = esTextoLargo && !expandido
        ? descripcion.substring(0, limiteCaracteres) + "..."
        : descripcion;

    return (
        <div className="mt-4 p-4 bg-white rounded-4 border border-secondary-subtle shadow-sm transition-all">
            <div className="d-flex align-items-center mb-3">
                <i className="bi bi-info-circle text-primary fs-4 me-2"></i>
                <h5 className="mb-0 fw-semibold text-dark">Acerca de este dispositivo</h5>
            </div>

            <p className="text-secondary lh-lg mb-2" style={{ fontSize: "0.95rem", textAlign: "justify" }}>
                {textoAMostrar}
            </p>

            {/* Botón dinámico de Leer más / Leer menos (solo aparece si el texto es largo) */}
            {esTextoLargo && (
                <button
                    onClick={() => setExpandido(!expandido)}
                    className="btn btn-link text-primary p-0 fw-semibold text-decoration-none"
                    style={{ fontSize: "0.9rem" }}
                >
                    {expandido ? (
                        <>Ver menos <i className="bi bi-chevron-up ms-1"></i></>
                    ) : (
                        <>Leer más <i className="bi bi-chevron-down ms-1"></i></>
                    )}
                </button>
            )}
        </div>
    );
};