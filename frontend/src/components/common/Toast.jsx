import { useEffect, useState } from "react";
import "../../style/Toast.css";

const Toast = ({ 
    mensaje, 
    cantidad, 
    icono, 
    visible, 
    onClose, 
    duracion = 3000 
}) => {
    const [isLeaving, setIsLeaving] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        if (visible) {
            setShouldRender(true);
            setIsLeaving(false);
            
            const timerAnim = setTimeout(() => {
                setIsLeaving(true);
            }, duracion - 400);

            const timerClose = setTimeout(() => {
                setShouldRender(false);
                onClose();
            }, duracion);

            return () => {
                clearTimeout(timerAnim);
                clearTimeout(timerClose);
            };
        } else if (shouldRender) {
            setIsLeaving(true);
            const timer = setTimeout(() => {
                setShouldRender(false);
            }, 400); 
            return () => clearTimeout(timer);
        }
    }, [visible, duracion, onClose, shouldRender]);

    if (!shouldRender) return null;

    const textoFinal = cantidad ? `${cantidad} ${mensaje}` : mensaje;
    const claseAnimacion = isLeaving ? "toast-animacion-salida" : "toast-animacion-entrada";

    return (
        <div className="position-fixed bottom-0 start-50 translate-middle-x mb-4" style={{ zIndex: 9999, pointerEvents: "none" }}>
            <div 
                className={`d-flex align-items-center gap-2 px-4 py-2 rounded-pill shadow bg-white border ${claseAnimacion}`}
            >
                <div className="d-flex align-items-center text-success fs-5">
                    {icono || <i className="bi bi-check-circle-fill"></i>}
                </div>

                <span className="fw-semibold text-dark" style={{ fontSize: "0.95rem", letterSpacing: "0.3px" }}>
                    {textoFinal}
                </span>
            </div>
        </div>
    );
};

export default Toast;