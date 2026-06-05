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

    // Solo necesitamos ejecutarPeticion para la lista
    const { ejecutarPeticion, isLoading: loadingFacturas } = useApi();

    // 3. Efecto para cargar las facturas
    useEffect(() => {
        const fetchFacturas = async () => {
            // Lógica inteligente: Si el endpoint ya tiene un '?', usamos '&' para la página
            const separador = endpointFetch.includes('?') ? '&' : '?';
            const urlFinal = `${endpointFetch}${separador}page=${paginaActual}`;

            // ¡Chau token y headers manuales! useApi se encarga de todo.
            const response = await ejecutarPeticion(urlFinal, { method: 'GET' });

            if (response.exito) {
                setFacturas(response.data.facturas || response.data);
                setPaginacion(response.data.paginacion || {});
            }
        };

        fetchFacturas();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paginaActual, endpointFetch]); 

    // 4. Funciones de Paginación y Modal
    const cambiarPagina = (pagina) => {
        setPaginaActual(pagina);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const verFactura = async (idFactura) => {
        setCargandoPdf(true);
        setMostrarModal(true);

        // Para descargar archivos (Blobs), mantenemos el fetch nativo 
        // ya que nuestro useApi asume que todo es JSON.
        const token = localStorage.getItem('token');

        try {
            const URL_BACKEND = 'http://localhost:3000/api';
            const response = await fetch(`${URL_BACKEND}/facturas/detalle-factura/${idFactura}/pdf`, {
                method: 'GET',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                const blob = await response.blob(); // Convertimos la respuesta a binario
                if (blob.type !== 'application/pdf') {
                    throw new Error("Formato de archivo incorrecto");
                }
                const urlTemporal = URL.createObjectURL(blob);
                setPdfUrl(urlTemporal);
            } else {
                throw new Error(`Error del servidor: ${response.status}`);
            }
        } catch (error) {
            console.error("Error al cargar el PDF:", error);
            setPdfUrl(null);
        } finally {
            setCargandoPdf(false);
        }
    };

    const cerrarModal = () => {
        setMostrarModal(false);
        if (pdfUrl) {
            URL.revokeObjectURL(pdfUrl); // Limpiamos la memoria del navegador
            setPdfUrl(null);
        }
    };

    // 5. Renderizado de la UI
    return (
        <div className="bg-light p-4 rounded-3">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fs-6 fw-bold m-0">Historial de Pagos</h5>
            </div>

            {loadingFacturas ? (
                <div className="text-center py-4">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                    <span className="text-secondary" style={{ fontSize: "14px" }}>Cargando historial...</span>
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
                                <button className="btn btn-light btn-sm text-secondary px-2" onClick={() => verFactura(item.id)}>
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
                <div className="text-center py-4 text-secondary" style={{ fontSize: "14px" }}>
                    <i className="bi bi-credit-card-2-back mb-2 fs-3 d-block opacity-50"></i>
                    No hay facturas registradas.
                </div>
            )}

            {/* MODAL DEL PDF */}
            {mostrarModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg">
                            <div className="modal-header bg-light border-0">
                                <h5 className="modal-title fw-bold text-dark">
                                    <i className="bi bi-file-earmark-pdf text-danger me-2"></i> Detalle de Factura
                                </h5>
                                <button type="button" className="btn-close" onClick={cerrarModal}></button>
                            </div>
                            <div className="modal-body p-0" style={{ height: '65vh' }}>
                                {cargandoPdf ? (
                                    <div className="d-flex justify-content-center align-items-center h-100">
                                        <div className="spinner-border text-primary mb-3" role="status"></div>
                                        <span className="ms-3 text-secondary">Generando factura...</span>
                                    </div>
                                ) : pdfUrl ? (
                                    <iframe src={pdfUrl} width="100%" height="100%" style={{ border: 'none' }} title="Visor de Factura" />
                                ) : (
                                    <div className="d-flex flex-column justify-content-center align-items-center h-100 text-secondary">
                                        <i className="bi bi-file-earmark-x fs-1 mb-3 text-danger opacity-75"></i>
                                        <h5>No se pudo cargar el PDF</h5>
                                        <p className="small">Asegúrate de que el endpoint esté funcionando.</p>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer bg-light border-0">
                                <button type="button" className="btn btn-secondary fw-semibold" onClick={cerrarModal}>Cerrar</button>
                                {pdfUrl && (
                                    <a href={pdfUrl} download="Factura.pdf" className="btn btn-primary fw-semibold">
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