const ModalConfirmarAccion = ({
    isOpen,
    onConfirmar,
    onCancelar,
    titulo,
    mensajePrincipal,
    nombreItem,
    mensajeExtra,
    textoBoton = "Confirmar",
    colorBoton = "btn-primary", // Por defecto es azul, pero lo podés cambiar
    iconoBoton = "bi-check-circle"
}) => {

    if (!isOpen) return null;

    return (
        <div className="modal d-block" style={{
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex !important",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            zIndex: 1050
        }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content shadow-lg">

                    {/* HEADER */}
                    <div className="modal-header border-0 pb-0">
                        <button type="button" className="btn-close" onClick={onCancelar} />
                    </div>

                    {/* BODY */}
                    <div className="modal-body text-center pt-2 pb-2">
                        <h5 className="fw-bold">{titulo}</h5>
                        <p className="text-muted mt-3">
                            {mensajePrincipal} <strong>{nombreItem}</strong>.<br />
                            <span className="small">{mensajeExtra}</span>
                        </p>
                    </div>

                    {/* FOOTER */}
                    <div className="modal-footer border-0 d-flex gap-2 justify-content-center pt-0 pb-4">
                        <button
                            type="button"
                            className="btn btn-outline-secondary px-4 fw-semibold"
                            onClick={onCancelar}
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            className={`btn ${colorBoton} px-4 d-flex align-items-center fw-semibold`}
                            onClick={onConfirmar}
                        >
                            <i className={`bi ${iconoBoton} me-2`} />
                            {textoBoton}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ModalConfirmarAccion;