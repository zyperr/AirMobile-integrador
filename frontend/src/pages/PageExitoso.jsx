import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useCarrito } from "../context/CarritoContext";

const PagoExitoso = () => {
    // Extraemos la función para limpiar el carrito de tu contexto
    const { limpiarCarritoPantalla } = useCarrito();
    
    // Mercado Pago enviará datos en la URL (ej: ?collection_id=123&status=approved)
    const [searchParams] = useSearchParams();
    const paymentId = searchParams.get("payment_id") || searchParams.get("collection_id");

    useEffect(() => {
        // Apenas carga la página de éxito, vaciamos el carrito del frontend
        limpiarCarritoPantalla();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <main className="d-flex flex-column justify-content-center align-items-center text-center px-3 slide-down-animation" style={{ minHeight: '80vh' }}>
            
            <div className="mb-4 position-relative">
                {/* Un círculo decorativo de fondo */}
                <div className="position-absolute top-50 start-50 translate-middle bg-success bg-opacity-10 rounded-circle" style={{ width: '150px', height: '150px', zIndex: -1 }}></div>
                <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '5rem' }}></i>
            </div>

            <h1 className="fw-bold text-dark mb-3">¡Pago realizado con éxito!</h1>
            
            <p className="text-muted mb-2" style={{ maxWidth: '500px', fontSize: '1.1rem' }}>
                Muchas gracias por tu compra en AirMobile. Tu pedido ya está siendo procesado.
            </p>
            
            {paymentId && (
                <div className="bg-light px-4 py-2 rounded-pill mb-5 shadow-sm border">
                    <span className="text-secondary fw-medium" style={{ fontSize: '14px' }}>
                        Número de comprobante: <strong className="text-dark">#{paymentId}</strong>
                    </span>
                </div>
            )}

            <div className="d-flex gap-3">
                <Link to="/perfil-usuario/facturacion" onClick={ ()=>{ window.scrollTo(0, 0); }} className="btn btn-outline-primary px-4 py-2 fw-semibold rounded-pill shadow-sm">
                    <i className="bi bi-receipt me-2"></i> Ver Factura
                </Link>
                <Link to="/catalogo" onClick={ ()=>{ window.scrollTo(0, 0); }} className="btn btn-primary px-4 py-2 fw-semibold rounded-pill shadow-sm">
                    <i className="bi bi-shop me-2"></i> Seguir Comprando
                </Link>
            </div>

        </main>
    );
};

export default PagoExitoso;