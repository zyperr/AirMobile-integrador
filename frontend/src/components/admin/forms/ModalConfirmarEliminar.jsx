
// Modal de confirmación antes de eliminar un producto
// Usa el mismo estilo Bootstrap que ModalNuevoProducto
const ModalConfirmarEliminar = ({ isOpen, onConfirmar, onCancelar, nombreProducto }) => {

    // Si está cerrado no renderizamos nada
    if (!isOpen) return null;

    return (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex !important",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh"
        }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">

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
                        <h5 className="modal-eliminar-titulo">
                            ¿Eliminar producto?
                        </h5>
                        <p className="modal-eliminar-subtitulo">
                            Estás por eliminar <strong>{nombreProducto}</strong>.
                            Esta acción no se puede deshacer.
                        </p>
                    </div>

                    {/* FOOTER */}
                    <div className="modal-footer border-0 d-flex gap-2 justify-content-center pt-0">
                        <button
                            type="button"
                            className="btn btn-outline-secondary modal-eliminar-btn-cancelar"
                            onClick={onCancelar}
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            className="btn modal-eliminar-btn-confirmar"
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
