import React from 'react';

export const TarjetaEstadistica = ({ titulo, valor, color = "#0d6efd" }) => {
    return (
        <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '20px' }}>
            <div className="card-body d-flex flex-column align-items-center justify-content-center py-4">
                <span 
                    className="text-muted fw-semibold mb-2" 
                    style={{ fontSize: '1.05rem', letterSpacing: '0.3px' }}
                >
                    {titulo}
                </span>
                <span 
                    className="fw-bold mb-0" 
                    style={{ color: color, fontSize: '3.2rem', lineHeight: '1' }}
                >
                    {valor}
                </span>
            </div>
        </div>
    );
};