import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useCarrito } from "../context/CarritoContext";

const PagoPendiente = () => {
    const { vaciarCarrito } = useCarrito();
    const [searchParams] = useSearchParams();
    const paymentId = searchParams.get("payment_id") || searchParams.get("collection_id");

    useEffect(() => {
        // Vaciamos el carrito localmente porque la orden ya está "reservada"
        vaciarCarrito();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <main className="d-flex flex-column justify-content-center align-items-center text-center px-3 slide-down-animation" style={{ minHeight: '80vh' }}>
            
            <div className="mb-4 position-relative">
                {/* Círculo amarillo suave de fondo */}
                <div className="position-absolute top-50 start-50 translate-middle bg-warning bg-opacity-10 rounded-circle" style={{ width: '150px', height: '150px', zIndex: -1 }}></div>
                <i className="bi bi-hourglass-split text-warning" style={{ fontSize: '5rem' }}></i>
            </div>

            <h1 className="fw-bold text-dark mb-3">Tu pago está pendiente</h1>
            
            <p className="text-muted mb-2" style={{ maxWidth: '500px', fontSize: '1.1rem' }}>
                Si elegiste pagar en efectivo o por transferencia, tu pedido se procesará apenas Mercado Pago nos confirme la recepción del dinero.
            </p>
            
            {paymentId && (
                <div className="bg-light px-4 py-2 rounded-pill mb-5 shadow-sm border mt-3">
                    <span className="text-secondary fw-medium" style={{ fontSize: '14px' }}>
                        Número de seguimiento: <strong className="text-dark">#{paymentId}</strong>
                    </span>
                </div>
            )}

            <div className="d-flex gap-3">
                <Link to="/catalogo" className="btn btn-outline-primary px-4 py-2 fw-semibold rounded-pill shadow-sm">
                    <i className="bi bi-shop me-2"></i> Seguir Comprando
                </Link>
            </div>

        </main>
    );
};

export default PagoPendiente;