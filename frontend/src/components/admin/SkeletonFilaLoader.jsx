import React from 'react';

export const SkeletonFilaProducto = ({cantidad}) => {
const tarjetasFalsas = Array.from({ length: cantidad});
return (
        <>
            {/* Iteramos sobre ese nuevo array usando el index */}
            {tarjetasFalsas.map((_, index) => (
                
                <div className="tabla-fila d-flex align-items-center placeholder-glow p-2 border-bottom">
 
            {/* Imagen + nombre */}
            <div className="tabla-col-nombre d-flex align-items-start gap-3 flex-grow-1">
 
                {/* Placeholder imagen */}
                <div
                    className="placeholder rounded"
                    style={{ width: "50px", height: "50px" }}
                />
 
                {/* Placeholder nombre y variante */}
                <div className="d-flex flex-column justify-content-center w-50">
                    <span className="placeholder col-12 mb-2" />
                    <span className="placeholder col-8" />
                </div>
 
            </div>
 
            {/* Placeholder badge de estado */}
            <div className="tabla-col-estado">
                <span
                    className="placeholder rounded-pill"
                    style={{ width: "80px", height: "24px" }}
                />
            </div>
 
            {/* Placeholder precio */}
            <div className="tabla-col-precio">
                <span className="placeholder col-6" />
            </div>
 
        </div>
                
            ))}
        </>
    );
};
