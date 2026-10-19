

export default function Paginacion({ 
    paginaActual, 
    tienePaginaAnterior, 
    tienePaginaSiguiente, 
    cambiarPagina 
}) {



    return (
        <div className="d-flex justify-content-center mt-5 mb-4">
            <div className="d-flex align-items-center gap-3">
                
                {/* BOTÓN ANTERIOR */}
                <button 
                    className="btn btn-outline-primary px-4 py-2 rounded-pill fw-semibold"
                    disabled={!tienePaginaAnterior} 
                    onClick={() => cambiarPagina(paginaActual - 1)}
                >
                    <i className="bi bi-chevron-left me-2"></i> Anterior
                </button>

                {/* INDICADOR DE PÁGINA (Sutil y útil para el usuario) */}
                <span className="fw-bold text-secondary px-2">
                    {paginaActual}
                </span>

                {/* BOTÓN SIGUIENTE */}
                <button 
                    className="btn btn-outline-primary px-4 py-2 rounded-pill fw-semibold"
                    disabled={!tienePaginaSiguiente} 
                    onClick={() => cambiarPagina(paginaActual + 1)}
                >
                    Siguiente <i className="bi bi-chevron-right ms-2"></i>
                </button>
                
            </div>
        </div>
    );
}