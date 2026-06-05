import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useApi } from "../../../hooks/useApi";
import ProductCard from "../../productos/CartaDeProductos";


const ListaDeseosPerfil = () => {
    // 1. Estados locales exclusivos para esta vista
    const [listaDeseos, setListaDeseos] = useState({ data: [], total: 0 });
    
    // 2. Traemos nuestro hook useApi para manejar el fetch
    const { ejecutarPeticion: fetchListaDeseos, isLoading: loadingDeseos, error: errorDeseos } = useApi();

    // 3. Hacemos la petición SOLO cuando este componente se monta en la pantalla
    useEffect(() => {
        const fetchDeseos = async () => {
            const responseDeseos = await fetchListaDeseos('lista-deseados/obtener', { method: 'GET' });

            if (responseDeseos.exito) {
                setListaDeseos(responseDeseos.data);
            }
        };

        fetchDeseos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 4. Función para actualizar la UI cuando desmarcan un corazón
    const quitarDeseoLocalmente = (idProductoEliminado) => {
        setListaDeseos(prevEstado => ({
            ...prevEstado,
            data: prevEstado.data.filter(producto => producto.producto_id !== idProductoEliminado),
            total: prevEstado.total - 1
        }));
    };

    return (
        <section className="mb-5 slide-down-animation">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fs-4 fw-bold m-0" style={{ color: '#5a5a5a' }}>Lista de Deseos</h3>

                {/* El badge solo se muestra si NO está cargando, NO hay error, y hay productos */}
                {!loadingDeseos && !errorDeseos && listaDeseos.data.length > 0 && (
                    <span className="badge rounded-pill px-3 py-2 shadow-sm" style={{ backgroundColor: '#0d6efd', color: '#fff', fontSize: '0.85rem' }}>
                        {listaDeseos.total} {listaDeseos.total === 1 ? 'ítem' : 'ítems'}
                    </span>
                )}
            </div>

            {/* LÓGICA DE RENDERIZADO: Cargando -> Error -> Vacío -> Lista */}
            {loadingDeseos ? (
                /* ESTADO 1: CARGANDO */
                <div className="w-100 mt-2">
                    <div
                        className="p-5 rounded-4 text-center shadow-sm d-flex flex-column align-items-center justify-content-center"
                        style={{ backgroundColor: '#f8f9fa', border: '1px solid #e9ecef', minHeight: '250px' }}
                    >
                        <div className="spinner-border text-primary mb-3" role="status" style={{ width: "2.5rem", height: "2.5rem" }}>
                            <span className="visually-hidden">Cargando...</span>
                        </div>
                        <h5 className="fw-semibold text-secondary">Cargando tus favoritos...</h5>
                    </div>
                </div>

            ) : errorDeseos ? (
                /* ESTADO 2: ERROR */
                <div className="w-100 mt-2">
                    <div
                        className="p-5 rounded-4 text-center shadow-sm d-flex flex-column align-items-center justify-content-center"
                        style={{ backgroundColor: '#fff5f5', border: '1px solid #ffe3e3', minHeight: '250px' }}
                    >
                        <i className="bi bi-cloud-slash text-danger mb-3" style={{ fontSize: '3.5rem' }}></i>
                        <h5 className="fw-bold text-danger">¡Oops! Hubo un problema</h5>
                        <p className="text-muted mb-4" style={{ maxWidth: '400px' }}>
                            {errorDeseos || "No pudimos cargar tu lista de deseos en este momento. Por favor, revisa tu conexión e inténtalo de nuevo."}
                        </p>
                        <button
                            className="btn px-4 py-2 fw-semibold rounded-pill shadow-sm"
                            style={{ backgroundColor: '#0d6efd', color: '#fff' }}
                            onClick={() => window.location.reload()}
                        >
                            <i className="bi bi-arrow-clockwise me-2"></i>Reintentar
                        </button>
                    </div>
                </div>

            ) : listaDeseos.data.length === 0 ? (
                /* ESTADO 3: VACÍO */
                <div className="w-100 mt-2">
                    <div
                        className="p-5 rounded-4 text-center shadow-sm d-flex flex-column align-items-center justify-content-center"
                        style={{ backgroundColor: '#0d6efd0d', border: '2px dashed #0d6efd40', minHeight: '250px' }}
                    >
                        <i className="bi bi-balloon-heart mb-3" style={{ fontSize: '3.5rem', color: '#0d6efd' }}></i>
                        <h5 className="fw-bold" style={{ color: '#0d6efd' }}>¡Tu lista está muy solita!</h5>
                        <p className="text-muted mb-4" style={{ maxWidth: '400px' }}>
                            Aún no has guardado ninguno de nuestros productos. Explora el catálogo y dale amor a tus favoritos.
                        </p>
                        <Link to="/catalogo" className="btn px-4 py-2 fw-semibold rounded-pill shadow-sm" style={{ backgroundColor: '#0d6efd', color: '#fff' }}>
                            Ir al catálogo
                        </Link>
                    </div>
                </div>

            ) : (
                /* ESTADO 4: CON RESULTADOS */
                <div
                    className="d-flex flex-row gap-3 pb-4 custom-horizontal-scroll"
                    style={{
                        overflowX: 'auto',
                        overflowY: 'hidden',
                        scrollSnapType: 'x mandatory',
                        WebkitOverflowScrolling: 'touch'
                    }}
                >
                    {listaDeseos.data.map((product) => (
                        <div
                            key={product.producto_id}
                            className="flex-shrink-0"
                            style={{ width: '260px', scrollSnapAlign: 'start' }}
                        >
                            <ProductCard
                                id={product.producto_id}
                                nombreDeProducto={product.nombre_producto}
                                imagen_url={product.imagen_url}
                                precio={product.precio}
                                capacidad={product.capacidad}
                                condicion={product.condicion}
                                onRemover={quitarDeseoLocalmente}
                            />
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
};

export default ListaDeseosPerfil;