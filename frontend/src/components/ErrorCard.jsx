export const ErrorCard = ({errorServidor}) => {
    return (
        <div className="alert alert-danger d-flex align-items-center border-0 shadow-sm mb-4" role="alert" style={{ borderRadius: '10px', fontSize: '0.9rem' }}>
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            <div>
                {errorServidor}
            </div>
        </div>
    )
}