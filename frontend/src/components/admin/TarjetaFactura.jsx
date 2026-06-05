import React from 'react';

export const TarjetaFactura = ({ titulo, valor, extraTag, extraTagColor, iconoFooter, textoFooter }) => {
    return (
        <div className="card border-0 shadow-sm h-100 position-relative overflow-hidden" style={{ borderRadius: '20px' }}>
            <div
                className="position-absolute rounded-circle"
                style={{
                    width: '100px', height: '100px', top: '-20px', right: '-20px',
                    backgroundColor: '#f8f9fa', zIndex: 0
                }}
            />

            <div className="card-body d-flex flex-column justify-content-center p-3 p-lg-4 position-relative" style={{ zIndex: 1 }}>
                <span className="text-muted fw-bold text-uppercase mb-2" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
                    {titulo}
                </span>

                <div className="d-flex align-items-baseline flex-wrap gap-2 mb-3 mb-lg-4">
                    {/* fs-2 en móvil, fs-1 en grandes para evitar desbordamientos */}
                    <h3 className="fw-bold mb-0 fs-2 fs-lg-1" style={{ color: '#111827' }}>
                        {valor}
                    </h3>
                    {extraTag && (
                        <span className={`fw-semibold ${extraTagColor}`} style={{ fontSize: '0.9rem' }}>
                            {extraTag}
                        </span>
                    )}
                </div>

                <div className="text-muted d-flex align-items-center gap-2" style={{ fontSize: '0.85rem' }}>
                    <i className={`bi ${iconoFooter}`}></i>
                    <span>{textoFooter}</span>
                </div>
            </div>
        </div>
    );
};