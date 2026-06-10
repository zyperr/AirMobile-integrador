import { useEffect, useState } from "react";
import { useApi } from "../../../hooks/useApi";
import Paginacion from "../../common/Paginacion";

const HistorialFacturas = () => {
    const endpointFetch = "facturas/obtener-facturas-usuario";
    
    // 1. Estados exclusivos de la facturación
    const [facturas, setFacturas] = useState([]);
    const [paginaActual, setPaginaActual] = useState(1);
    const [paginacion, setPaginacion] = useState({});

    // 2. Estados del Modal y PDF
    const [mostrarModal, setMostrarModal] = useState(false);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [cargandoPdf, setCargandoPdf] = useState(false);
    const [errorPdf, setErrorPdf] = useState(null); // NUEVO: Estado para el error del PDF

    // 3. Extraemos 'error' del hook useApi
    const { ejecutarPeticion, isLoading: loadingFacturas, error: errorFacturas } = useApi();

    // 4. Efecto para cargar las facturas
    useEffect(() => {
        const fetchFacturas = async () => {
            const separador = endpointFetch.includes('?') ? '&' : '?';
            const urlFinal = `${endpointFetch}${separador}page=${paginaActual}`;

            const response = await ejecutarPeticion(urlFinal, { method: 'GET' });

            if (response.exito) {
                setFacturas(response.data.facturas || response.data);
                setPaginacion(response.data.paginacion || {});
            }
        };

        fetchFacturas();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paginaActual, endpointFetch]); 

    // 5. Funciones de Paginación y Modal
    const cambiarPagina = (pagina) => {
        setPaginaActual(pagina);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const verFactura = async (idFactura) => {
        setCargandoPdf(true);
        setMostrarModal(true);
        setErrorPdf(null); // Limpiamos errores anteriores al abrir uno nuevo

        const token = localStorage.getItem('token');

        try {
            const URL_BACKEND = 'http://localhost:3000/api';
            const response = await fetch(`${URL_BACKEND}/facturas/detalle-factura/${idFactura}/pdf`, {
                method: 'GET',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                const blob = await response.blob(); 
                if (blob.type !== 'application/pdf') {
                    throw new Error("El archivo devuelto no es un PDF válido.");
                }
                const urlTemporal = URL.createObjectURL(blob);
                setPdfUrl(urlTemporal);
            } else {
                throw new Error("No pudimos generar el documento. Intenta más tarde.");
            }
        } catch (error) {
            console.error("Error al cargar el PDF:", error);
            setErrorPdf(error.message || "Hubo un problema de conexión al cargar la factura.");
            setPdfUrl(null);
        } finally {
            setCargandoPdf(false);
        }
    };

    const cerrarModal = () => {
        setMostrarModal(false);
        if (pdfUrl) {
            URL.revokeObjectURL(pdfUrl);
            setPdfUrl(null);
        }
    };

    // 6. Renderizado de la UI
    return (
        <div className="bg-light p-4 rounded-3">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fs-6 fw-bold m-0 text-dark">Historial de Pagos</h5>
            </div>

            {/* LÓGICA DE RENDERIZADO: Cargando -> Error -> Lista Vacia -> Lista Llenita */}
            {loadingFacturas ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary mb-3" role="status" style={{ width: "2.5rem", height: "2.5rem" }}></div>
                    <p className="text-secondary fw-semibold">Cargando historial...</p>
                </div>
            ) : errorFacturas ? (
                
                /* DISEÑO DE ERROR (Mismo estilo que usamos en Lista de Deseos) */
                <div className="w-100 mt-2">
                    <div 
                        className="p-5 rounded-4 text-center shadow-sm d-flex flex-column align-items-center justify-content-center" 
                        style={{ backgroundColor: '#fff5f5', border: '1px solid #ffe3e3', minHeight: '200px' }}
                    >
                        <i className="bi bi-cloud-slash text-danger mb-3" style={{ fontSize: '3rem' }}></i>
                        <h5 className="fw-bold text-danger">No pudimos cargar tus facturas</h5>
                        <p className="text-muted mb-4" style={{ maxWidth: '400px' }}>
                            {errorFacturas || "Hubo un problema de conexión con el servidor. Por favor, revisa tu internet e inténtalo de nuevo."}
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

            ) : facturas.length > 0 ? (
                <>
                    {facturas.map((item) => (
                        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center py-3 border-bottom border-secondary border-opacity-10 gap-3" key={item.id}>
                            <div className="d-flex align-items-center gap-3">
                                <div className="bg-white rounded p-2 text-secondary shadow-sm">
                                    <i className="bi bi-receipt"></i>
                                </div>
                                <div>
                                    <p className="m-0 fw-bold text-dark" style={{ fontSize: "14px" }}>INV-{item.id}</p>
                                    <p className="m-0 text-secondary" style={{ fontSize: "12px" }}>
                                        {item.fecha_formateada || item.fecha} • <span className="text-capitalize">{item.estado || 'Completado'}</span>
                                    </p>
                                </div>
                            </div>
                            <div className="d-flex align-items-center justify-content-between justify-content-sm-end gap-3">
                                <span className="fw-bold text-dark" style={{ fontSize: "15px" }}>${parseFloat(item.total).toFixed(2)}</span>
                                <button className="btn btn-light btn-sm text-secondary px-2 border" onClick={() => verFactura(item.id)}>
                                    <i className="bi bi-eye"></i>
                                </button>
                            </div>
                        </div>
                    ))}
                    <div className="mt-4">
                        <Paginacion
                            paginaActual={paginacion.paginaActual || 1}
                            tienePaginaAnterior={paginacion.tienePaginaAnterior}
                            tienePaginaSiguiente={paginacion.tienePaginaSiguiente}
                            cambiarPagina={cambiarPagina}
                        />
                    </div>
                </>
            ) : (
                <div className="text-center py-5 text-secondary">
                    <i className="bi bi-receipt mb-3 fs-1 d-block opacity-50"></i>
                    <h6 className="fw-semibold">No hay facturas registradas</h6>
                    <p className="small mb-0">Tus comprobantes de compra aparecerán aquí.</p>
                </div>
            )}

            {/* MODAL DEL PDF */}
            {mostrarModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)' }} tabIndex="-1">
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg overflow-hidden">
                            <div className="modal-header bg-light border-0">
                                <h5 className="modal-title fw-bold text-dark fs-6">
                                    <i className="bi bi-file-earmark-pdf text-danger me-2"></i> Detalle de Factura
                                </h5>
                                <button type="button" className="btn-close" onClick={cerrarModal}></button>
                            </div>
                            <div className="modal-body p-0 bg-white" style={{ height: '65vh' }}>
                                
                                {/* Manejo de estados dentro del PDF */}
                                {cargandoPdf ? (
                                    <div className="d-flex flex-column justify-content-center align-items-center h-100">
                                        <div className="spinner-border text-primary mb-3" role="status"></div>
                                        <span className="fw-medium text-secondary">Generando documento...</span>
                                    </div>
                                ) : errorPdf ? (
                                    <div className="d-flex flex-column justify-content-center align-items-center h-100 text-center px-4">
                                        <div className="rounded-circle bg-danger bg-opacity-10 p-4 mb-3">
                                            <i className="bi bi-file-earmark-x fs-1 text-danger"></i>
                                        </div>
                                        <h5 className="fw-bold text-dark">Error al visualizar</h5>
                                        <p className="text-muted small mb-0" style={{ maxWidth: '300px' }}>
                                            {errorPdf}
                                        </p>
                                    </div>
                                ) : pdfUrl ? (
                                    <iframe src={pdfUrl} width="100%" height="100%" style={{ border: 'none' }} title="Visor de Factura" />
                                ) : null}

                            </div>
                            <div className="modal-footer bg-light border-0">
                                <button type="button" className="btn btn-outline-secondary fw-semibold" onClick={cerrarModal}>Cerrar</button>
                                {pdfUrl && !errorPdf && (
                                    <a href={pdfUrl} download="Factura.pdf" className="btn btn-primary fw-semibold shadow-sm">
                                        <i className="bi bi-download me-2"></i> Descargar PDF
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HistorialFacturas;