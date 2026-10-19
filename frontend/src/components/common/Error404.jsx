import { Link } from 'react-router-dom';

const Error404 = () => {
    return (
        <main className="d-flex flex-column justify-content-center align-items-center text-center mb-5 px-3 slide-down-animation" style={{ minHeight: '80vh' }}>
            
            {/* Ícono gigante y número 404 */}
            <div className="mb-4">
                <i className="bi bi-compass text-primary" style={{ fontSize: '5rem', opacity: 0.8 }}></i>
                <h1 className="fw-bold text-primary mt-2" style={{ fontSize: '6rem', letterSpacing: '-2px', lineHeight: '1' }}>
                    404
                </h1>
            </div>

            {/* Mensaje amigable */}
            <h2 className="fs-3 fw-bold text-dark mb-3">
                ¡Ups! Parece que te perdiste
            </h2>
            <p className="text-muted mb-5" style={{ maxWidth: '500px', fontSize: '1.1rem' }}>
                La página que estás buscando no existe, fue movida o el enlace es incorrecto. 
                Pero no te preocupes, tenemos muchos equipos increíbles esperándote.
            </p>

            {/* Botón de rescate */}
            <Link 
                to="/catalogo" 
                className="btn btn-primary px-5 py-3 fw-bold rounded-pill shadow-sm d-inline-flex align-items-center transition-all"
            >
                <i className="bi bi-shop me-2 fs-5"></i> 
                Volver al Catálogo
            </Link>

        </main>
    );
};

export default Error404;