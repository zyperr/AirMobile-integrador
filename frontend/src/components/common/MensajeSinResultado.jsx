const MensajeSinResultados = ({ onLimpiarFiltros, text,text2 }) => {
    return (
        <div className="d-flex flex-column align-items-center justify-content-center w-100 h-100 text-center py-5">
            <i className="bi bi-search text-secondary opacity-50 mb-3" style={{ fontSize: "4rem" }}></i>
            <h3 className="fw-bold text-dark">No se encontraron resultados</h3>
            <p className="text-secondary">
                {text}<br/>{text2}
            </p>

            {/* Botón dinámico que ejecuta la función que le pasemos por props */}
            <button
                className="btn btn-outline-primary mt-3"
                onClick={onLimpiarFiltros}
            >
                Ver todos los productos
            </button>
        </div>
    );
};

export default MensajeSinResultados;