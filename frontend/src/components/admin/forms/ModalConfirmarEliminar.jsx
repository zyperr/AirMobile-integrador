// Modal genérico de confirmación de eliminación
// Se puede usar para productos, administradores, categorías, etc.
const ModalConfirmarEliminar = ({ 
    isOpen, 
    onConfirmar, 
    onCancelar, 
    nombreItem, // Reemplaza a nombreProducto
    titulo = "¿Eliminar elemento?", // Permite personalizar el título si querés
    mensajeExtra = "Esta acción no se puede deshacer." // Permite personalizar la advertencia
}) => {

    // Si está cerrado no renderizamos nada
    if (!isOpen) return null;

    return (
        <div className="modal d-block" style={{ 
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex !important",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            zIndex: 1050 // Asegura que quede por encima de todo
        }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content shadow-lg">

                    {/* HEADER */}
                    <div className="modal-header border-0 pb-0">
                        <button
                            type="button"
                            className="btn-close"
                            onClick={onCancelar}
                        />
                    </div>

                    {/* BODY */}
                    <div className="modal-body text-center pt-2 pb-2">
                        <h5 className="modal-eliminar-titulo fw-bold">
                            {titulo}
                        </h5>
                        <p className="modal-eliminar-subtitulo text-muted mt-3">
                            Estás por deshabilitar a <strong>{nombreItem}</strong>.<br />
                            {mensajeExtra}
                        </p>
                    </div>

                    {/* FOOTER */}
                    <div className="modal-footer border-0 d-flex gap-2 justify-content-center pt-0">
                        <button
                            type="button"
                            className="btn btn-outline-secondary modal-eliminar-btn-cancelar px-4"
                            onClick={onCancelar}
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            className="btn btn-danger modal-eliminar-btn-confirmar px-4 d-flex align-items-center"
                            onClick={onConfirmar}
                        >
                            <i className="bi bi-trash me-2" />
                            Eliminar
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ModalConfirmarEliminar;