import { Link } from "react-router-dom";

export const SuccessCard = ({ mensaje, descripcion, setSubmitted, text, linkTo, bgColor, sinFondo }) => {
    return (
        // Si sinFondo es true, quitamos 'registro-wrapper' y dejamos solo la animación
        <div className={sinFondo ? "animate__animated animate__fadeIn" : "registro-wrapper py-4 animate__animated animate__fadeIn d-flex flex-column align-items-center"}>
            
            <div 
                // Si le quitamos el fondo, le agregamos una sombra (shadow-lg) para que flote bonito
                className={`registro-card text-center p-5 ${sinFondo ? 'shadow-lg rounded-4' : ''}`}
                style={bgColor ? { backgroundColor: bgColor } : {}}
            >
                <div className="mb-4">
                    <i className="bi bi-check-circle-fill fs-1 text-success"></i>
                </div>
                <h3 className="fw-bold mb-2">
                    {mensaje}
                </h3>
                <p className="text-muted">
                    {descripcion}
                </p>
                <Link to={linkTo}>
                    <button 
                        className="btn-registro w-100 mb-3"
                        onClick={() => {
                            setSubmitted(false);
                        }}
                    >
                        {text}
                    </button>
                </Link>
            </div>
        </div>
    );
}