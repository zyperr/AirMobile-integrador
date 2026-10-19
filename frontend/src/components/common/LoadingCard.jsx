export const LoadingCard = ({text}) => {
    return (
        <div className=" container d-flex flex-column align-items-center justify-content-center mt-5 min-vh-100">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="mt-3 text-muted">{text}</p>
        </div>
    )
} 