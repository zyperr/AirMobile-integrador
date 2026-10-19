import { Link } from "react-router-dom";

const PagoFallido = () => {
    return (
        <main className="d-flex flex-column justify-content-center align-items-center text-center px-3 slide-down-animation" style={{ minHeight: '80vh' }}>
            
            <div className="mb-4 position-relative">
                {/* Círculo rojo suave de fondo */}
                <div className="position-absolute top-50 start-50 translate-middle bg-danger bg-opacity-10 rounded-circle" style={{ width: '150px', height: '150px', zIndex: -1 }}></div>
                <i className="bi bi-x-circle-fill text-danger" style={{ fontSize: '5rem' }}></i>
            </div>

            <h1 className="fw-bold text-dark mb-3">¡Uy! Algo salió mal con el pago</h1>
            
            <p className="text-muted mb-5" style={{ maxWidth: '500px', fontSize: '1.1rem' }}>
                Tu tarjeta fue rechazada o hubo un problema de conexión con el banco. 
                No te preocupes, <strong>no se te ha cobrado nada</strong>. Por favor, intenta nuevamente con otro medio de pago.
            </p>

            <div className="d-flex gap-3">
                <Link to="/carrito" onnClick={() => window.scrollTo(0, 0)} className="btn btn-primary px-5 py-3 fw-bold rounded-pill shadow-sm d-inline-flex align-items-center transition-all">
                    <i className="bi bi-cart-x me-2 fs-5"></i> 
                    Volver al Carrito
                </Link>
            </div>

        </main>
    );
};

export default PagoFallido;