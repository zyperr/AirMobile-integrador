import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi'; // Asegurate de que la ruta sea correcta
import { TarjetaFactura } from './TarjetaFactura';
import { FilaFactura } from './FilaFacturas';
import Paginacion from '../common/Paginacion'; // Asumiendo que tenés este componente

export const Facturas = () => {
    // 1. ESTADOS DE LA INTERFAZ Y FILTROS
    const [filtroActivo, setFiltroActivo] = useState('Todas');
    const [paginaActual, setPaginaActual] = useState(1);
    
    // 2. ESTADOS DE DATOS REALES
    const [facturas, setFacturas] = useState([]);
    const [paginacion, setPaginacion] = useState({});
    const [stats, setStats] = useState({
        totalFacturado: 0,
        totalPendiente: 0,
        cantidadPendientes: 0,
        facturasDelMes: 0
    });

    // 3. HOOKS DE LA API (Separamos en dos para manejar cargas independientes)
    const { ejecutarPeticion: fetchStats, isLoading: loadingStats } = useApi();
    const { ejecutarPeticion: fetchFacturas, isLoading: loadingFacturas } = useApi();

    // 4. CARGA DE ESTADÍSTICAS (Solo al entrar a la página)
    useEffect(() => {
        const cargarEstadisticas = async () => {
            const response = await fetchStats('facturas/estadisticas', { method: 'GET' });
            if (response.exito) {
                console.log("Estadísticas recibidas del backend:", response.data.data);
                setStats(response.data.data);
            }
        };
        cargarEstadisticas();
    }, []);

    // 5. CARGA DE LA TABLA (Se ejecuta al entrar, al cambiar de página o de filtro)
    useEffect(() => {
        const cargarListaFacturas = async () => {
            // Adaptamos el filtro visual al formato que espera el backend
            let estadoQuery = '';
            if (filtroActivo === 'Pagadas') estadoQuery = 'pagada';
            if (filtroActivo === 'Pendientes') estadoQuery = 'pendiente';
            if (filtroActivo === 'Vencidas') estadoQuery = 'vencida';

            // Armamos la URL dinámica con Joi en mente
            const url = `facturas/todas?page=${paginaActual}&limit=5${estadoQuery ? `&estado=${estadoQuery}` : ''}`;
            
            const response = await fetchFacturas(url, { method: 'GET' });
            
            if (response.exito) {
                setFacturas(response.data.facturas);
                // Guardamos los datos de paginación que nos manda tu controlador
                setPaginacion({
                    paginaActual: response.data.paginaActual,
                    totalPaginas: response.data.totalPaginas,
                    tienePaginaSiguiente: response.data.tienePaginaSiguiente,
                    tienePaginaAnterior: response.data.tienePaginaAnterior
                });
            }
        };
        cargarListaFacturas();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filtroActivo, paginaActual]); 

    // 6. FUNCIONES AUXILIARES
    const formatearDinero = (monto) => {
        return new Intl.NumberFormat('es-AR', { 
            style: 'currency', 
            currency: 'ARS' 
        }).format(monto || 0);
    };

    const cambiarPagina = (nuevaPagina) => {
        setPaginaActual(nuevaPagina);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const filtros = ['Todas', 'Pagadas', 'Pendientes', 'Vencidas'];
    console.log("Stats cargadas:", stats);
    return (
        <div className="container-fluid py-4 px-3 px-md-4" style={{ backgroundColor: '#f8f9fc', minHeight: '100vh' }}>

            {/* ENCABEZADO */}
            <div className="mb-4 mb-md-5 text-center text-md-start">
                <h1 className="fw-bold mb-2 fs-2 fs-md-1" style={{ color: '#111827' }}>Facturas</h1>
                <p className="text-muted mx-auto mx-md-0" style={{ fontSize: '1rem', maxWidth: '600px' }}>
                    Gestiona y supervisa todas las transacciones financieras y el estado de facturación de Air Mobile.
                </p>
            </div>

            {/* TARJETAS KPI ALIMENTADAS POR EL BACKEND */}
            <div className="row g-4 mb-4 mb-md-5">
                <div className="col-12 col-lg-4">
                    <TarjetaFactura
                        titulo="Total Facturado"
                        valor={loadingStats ? "Cargando..." : formatearDinero(stats.totalFacturado)}
                        extraTag="Global"
                        extraTagColor="text-success"
                        iconoFooter="bi-graph-up-arrow"
                        textoFooter="Histórico del sistema"
                    />
                </div>
                <div className="col-12 col-md-6 col-lg-4">
                    <TarjetaFactura
                        titulo="Pendientes de Pago"
                        valor={loadingStats ? "Cargando..." : formatearDinero(stats.totalPendiente)}
                        extraTag={`${stats.cantidadPendientes} facturas`}
                        extraTagColor="text-warning"
                        iconoFooter="bi-clock"
                        textoFooter="Requieren atención"
                    />
                </div>
                <div className="col-12 col-md-6 col-lg-4">
                    <TarjetaFactura
                        titulo="Facturas del Mes"
                        valor={loadingStats ? "..." : stats?.facturasDelMes?.toString()}
                        extraTag="Nuevas"
                        extraTagColor="text-primary"
                        iconoFooter="bi-calendar-check"
                        textoFooter="Generadas este mes"
                    />
                </div>
            </div>

            {/* BARRA DE FILTROS RESPONSIVE */}
            <div className="d-flex flex-column flex-xl-row justify-content-between align-items-xl-center gap-3 mb-4">
                <div className="w-100 overflow-x-auto pb-2 pb-xl-0" style={{ whiteSpace: 'nowrap' }}>
                    <div className="d-inline-flex gap-2 bg-white p-1 rounded-pill shadow-sm border border-light">
                        {filtros.map(filtro => (
                            <button
                                key={filtro}
                                onClick={() => {
                                    setFiltroActivo(filtro);
                                    setPaginaActual(1); // Reseteamos la paginación al cambiar de filtro
                                }}
                                className={`btn rounded-pill px-3 px-md-4 py-2 fw-semibold border-0 ${filtroActivo === filtro ? 'btn-dark text-white' : 'btn-light text-muted bg-transparent'}`}
                                style={{ fontSize: '0.85rem' }}
                            >
                                {filtro}
                            </button>
                        ))}
                    </div>
                </div>
                
                {/* Botón de búsqueda extra si lo necesitas a futuro */}
                <div className="d-flex flex-wrap flex-sm-nowrap gap-2 w-100 w-xl-auto">
                    <button className="btn bg-white border shadow-sm rounded-3 fw-medium text-secondary d-flex justify-content-center align-items-center gap-2 px-3 py-2 flex-grow-1 flex-xl-grow-0">
                        <i className="bi bi-sliders"></i> Filtros Avanzados
                    </button>
                </div>
            </div>

            {/* CONTENEDOR DE LA TABLA (REAL) */}
            <div className="bg-white rounded-4 shadow-sm border-0 overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0" style={{ minWidth: '800px' }}>
                        <thead style={{ backgroundColor: '#fdfdfd' }}>
                            <tr>
                                <th className="py-4 px-4 border-bottom text-muted fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '1.5px' }}>ID FACTURA</th>
                                <th className="py-4 px-4 border-bottom text-muted fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '1.5px' }}>CLIENTE</th>
                                <th className="py-4 px-4 border-bottom text-muted fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '1.5px' }}>EMISIÓN</th>
                                <th className="py-4 px-4 border-bottom text-muted fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '1.5px' }}>MONTO</th>
                                <th className="py-4 px-4 border-bottom text-muted fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '1.5px' }}>ESTADO</th>
                                <th className="py-4 px-4 border-bottom text-muted fw-bold text-end" style={{ fontSize: '0.7rem', letterSpacing: '1.5px' }}>ACCIONES</th>
                            </tr>
                        </thead>
                        <tbody className="border-top-0">
                            {loadingFacturas ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-5">
                                        <div className="spinner-border text-primary" role="status"></div>
                                        <div className="text-muted mt-2">Cargando facturas...</div>
                                    </td>
                                </tr>
                            ) : facturas.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-5 text-muted">
                                        <i className="bi bi-inbox fs-2 d-block mb-2"></i>
                                        No se encontraron facturas para este filtro.
                                    </td>
                                </tr>
                            ) : (
                                facturas.map((factura) => (
                                    <FilaFactura key={factura.id} factura={factura} />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {facturas.length > 0 && (
                    <div className="p-4 border-top">
                        <Paginacion
                            paginaActual={paginacion.paginaActual || 1}
                            tienePaginaAnterior={paginacion.tienePaginaAnterior}
                            tienePaginaSiguiente={paginacion.tienePaginaSiguiente}
                            cambiarPagina={cambiarPagina}
                        />
                    </div>
                )}
            </div>

        </div>
    );
};