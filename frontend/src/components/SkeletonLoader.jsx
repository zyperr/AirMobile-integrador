

export const SkeletonLoader = ({ cantidad = 8 }) => {
    
    // Array.from crea un arreglo vacío exactamente del tamaño que le pidas
    // Si cantidad es 4, crea: [undefined, undefined, undefined, undefined]
    const tarjetasFalsas = Array.from({ length: cantidad });

    return (
        <>
            {/* Iteramos sobre ese nuevo array usando el index */}
            {tarjetasFalsas.map((_, index) => (
                <div className="col" key={`skeleton-${index}`}>
                    <div className="card h-100 border-0 shadow-sm p-3 placeholder-glow">
                        <div className="placeholder col-12 rounded mb-3" style={{ height: '180px', backgroundColor: '#e9ecef' }}></div>
                        <div className="placeholder col-10 mb-2"></div>
                        <div className="placeholder col-6 mb-3"></div>
                        <div className="placeholder col-4 rounded-pill mb-4" style={{ height: '20px' }}></div>
                        <div className="mt-auto d-flex justify-content-between align-items-center pt-3 border-top">
                            <div className="placeholder col-4 h-4"></div>
                            <div className="placeholder col-5 h-4 py-3 rounded"></div>
                        </div>
                    </div>
                </div>
            ))}
        </>
    );
};