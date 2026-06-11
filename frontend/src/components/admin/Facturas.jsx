import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { TarjetaFactura } from './TarjetaFactura';
import { FilaFactura } from './FilaFacturas';
import Paginacion from '../common/Paginacion';
import { DatePickerPersonalizado } from '../common/DatePicker';

const ESTADOS = ['Pendiente', 'Completado', 'Enviado', 'Cancelado', 'Reembolsado'];

export const Facturas = () => {
    const [filtroEstado, setFiltroEstado] = useState('');
    const [busqueda, setBusqueda] = useState('');
    const [inputBusqueda, setInputBusqueda] = useState('');

    // --- NUEVO ESTADO PARA LA FECHA ---
    const [fechaFiltro, setFechaFiltro] = useState('');

    const [facturas, setFacturas] = useState([]);
    const [paginacion, setPaginacion] = useState({});
    const [paginaActual, setPaginaActual] = useState(1);
    const [stats, setStats] = useState({ totalFacturado: 0, totalPendiente: 0, cantidadPendientes: 0, facturasDelMes: 0 });

    const { ejecutarPeticion: fetchStats, isLoading: loadingStats } = useApi();
    const { ejecutarPeticion: fetchFacturas, isLoading: loadingFacturas, error } = useApi();

    // Carga estadísticas solo al montar
    useEffect(() => {
        const cargarEstadisticas = async () => {
            const response = await fetchStats('facturas/estadisticas', { method: 'GET' });
            if (response.exito) setStats(response.data.data);
        };
        cargarEstadisticas();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Carga facturas cuando cambian filtros, página O LA FECHA
    useEffect(() => {
        const cargarFacturas = async () => {
            const params = new URLSearchParams();
            params.set('page', paginaActual);
            params.set('limit', '10');
            if (filtroEstado) params.set('estado', filtroEstado);
            if (busqueda) params.set('buscar', busqueda);

            // Si hay una fecha seleccionada, la agregamos a la URL (formato YYYY-MM-DD)
            if (fechaFiltro) params.set('fecha', fechaFiltro);

            const respuesta = await fetchFacturas(`facturas/obtener-facturas?${params.toString()}`, {
                method: 'GET',
            });

            if (respuesta.exito) {
                setFacturas(respuesta.data.facturas);
                setPaginacion(respuesta.data);
            }
        };
        cargarFacturas();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paginaActual, filtroEstado, busqueda, fechaFiltro]); // dependencias 

    const cambiarFiltro = (estado) => {
        setFiltroEstado(prev => prev === estado ? '' : estado); // toggle
        setPaginaActual(1);
    };

    // Función para manejar el cambio de fecha
    const cambiarFecha = (nuevaFecha) => {
        setFechaFiltro(nuevaFecha);
        setPaginaActual(1); // Siempre que filtramos, volvemos a la página 1
    };

    const cambiarPagina = (pagina) => {
        setPaginaActual(pagina);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const onEstadoActualizado = (id, nuevoEstado) => {
        setFacturas(prev => prev.map(f => f.id === id ? { ...f, estado: nuevoEstado } : f));
    };

    const handleBuscar = (e) => {
        e.preventDefault();
        setBusqueda(inputBusqueda.trim());
        setPaginaActual(1);
    };

    const limpiarBusqueda = () => {
        setInputBusqueda('');
        setBusqueda('');
        setPaginaActual(1);
    };

    const formatearDinero = (monto) =>
        new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(monto || 0);

    // Formatear fecha para el badge visual (de YYYY-MM-DD a DD/MM/YYYY)
    const formatearFechaBadge = (fechaIso) => {
        if (!fechaIso) return '';
        const [year, month, day] = fechaIso.split('-');
        return `${day}/${month}/${year}`;
    };

    const estadoConfig = {
        Pendiente: { color: 'text-warning', icono: 'bi-clock' },
        Completado: { color: 'text-success', icono: 'bi-check-circle' },
        Enviado: { color: 'text-primary', icono: 'bi-truck' },
        Cancelado: { color: 'text-danger', icono: 'bi-x-circle' },
        Reembolsado: { color: 'text-secondary', icono: 'bi-arrow-counterclockwise' },
    };

    return (
        <div className="container-fluid py-4 px-3 px-md-4" style={{ backgroundColor: '#f8f9fc', minHeight: '100vh' }}>

            {/* ENCABEZADO */}
            <div className="mb-4 mb-md-5 text-center text-md-start">
                <h1 className="fw-bold mb-2 fs-2" style={{ color: '#111827' }}>Facturas</h1>
                <p className="text-muted mx-auto mx-md-0" style={{ fontSize: '1rem', maxWidth: '600px' }}>
                    Gestiona y supervisa todas las transacciones financieras de Air Mobile.
                </p>
            </div>

            {/* KPIs */}
            <div className="row g-4 mb-4 mb-md-5">
                <div className="col-12 col-lg-4">
                    <TarjetaFactura
                        titulo="Total Facturado"
                        valor={loadingStats ? '...' : formatearDinero(stats.totalFacturado)}
                        extraTag="Global"
                        extraTagColor="text-success"
                        iconoFooter="bi-graph-up-arrow"
                        textoFooter="Histórico del sistema"
                    />
                </div>
                <div className="col-12 col-md-6 col-lg-4">
                    <TarjetaFactura
                        titulo="Pendientes de Pago"
                        valor={loadingStats ? '...' : formatearDinero(stats.totalPendiente)}
                        extraTag={`${stats.cantidadPendientes} facturas`}
                        extraTagColor="text-warning"
                        iconoFooter="bi-clock"
                        textoFooter="Requieren atención"
                    />
                </div>
                <div className="col-12 col-md-6 col-lg-4">
                    <TarjetaFactura
                        titulo="Facturas del Mes"
                        valor={loadingStats ? '...' : String(stats.facturasDelMes)}
                        extraTag="Nuevas"
                        extraTagColor="text-primary"
                        iconoFooter="bi-calendar-check"
                        textoFooter="Generadas este mes"
                    />
                </div>
            </div>

            {/* BARRA DE BÚSQUEDA + FILTROS */}
            <div className="d-flex flex-column flex-xl-row justify-content-between align-items-xl-center gap-3 mb-4">

                {/* Agrupamos la Búsqueda y la Fecha juntos */}
                <div className="d-flex flex-column flex-md-row gap-2" style={{ flexGrow: 1, maxWidth: '600px' }}>
                    {/* Búsqueda por nombre de cliente */}
                    <form onSubmit={handleBuscar} className="d-flex gap-2" style={{ flexGrow: 1 }}>
                        <div className="input-group shadow-sm">
                            <span className="input-group-text bg-white border-end-0">
                                <i className="bi bi-search text-muted" />
                            </span>
                            <input
                                type="text"
                                className="form-control border-start-0 border-end-0"
                                placeholder="Buscar por cliente..."
                                value={inputBusqueda}
                                onChange={e => setInputBusqueda(e.target.value)}
                            />
                            {inputBusqueda && (
                                <button type="button" className="btn btn-white border border-start-0 bg-white" onClick={limpiarBusqueda}>
                                    <i className="bi bi-x text-muted" />
                                </button>
                            )}
                        </div>
                        <button type="submit" className="btn btn-dark px-3">Buscar</button>
                    </form>

                    {/* Filtro de Fecha */}
                    <DatePickerPersonalizado
                        fecha={fechaFiltro}
                        onChange={cambiarFecha}
                        onClear={() => cambiarFecha('')}
                    />
                </div>

                {/* Píldoras de estado */}
                <div className="overflow-x-auto pb-1" style={{ whiteSpace: 'nowrap' }}>
                    <div className="d-inline-flex gap-2 bg-white p-1 rounded-pill shadow-sm border border-light">
                        <button
                            onClick={() => { setFiltroEstado(''); setPaginaActual(1); }}
                            className={`btn rounded-pill px-3 py-2 fw-semibold border-0 ${filtroEstado === '' ? 'btn-dark text-white' : 'btn-light text-muted bg-transparent'}`}
                            style={{ fontSize: '0.85rem' }}
                        >
                            Todas
                        </button>
                        {ESTADOS.map(estado => {
                            const cfg = estadoConfig[estado];
                            const activo = filtroEstado === estado;
                            return (
                                <button
                                    key={estado}
                                    onClick={() => cambiarFiltro(estado)}
                                    className={`btn rounded-pill px-3 py-2 fw-semibold border-0 ${activo ? 'btn-dark text-white' : 'btn-light text-muted bg-transparent'}`}
                                    style={{ fontSize: '0.85rem' }}
                                >
                                    {!activo && <i className={`bi ${cfg.icono} ${cfg.color} me-1`} />}
                                    {estado}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* TABLA */}
            <div className="bg-white rounded-4 shadow-sm border-0 overflow-hidden">
                {error && (
                    <div className="p-4 text-danger" style={{ fontSize: 14 }}>
                        <i className="bi bi-exclamation-triangle me-2" />
                        Error al cargar facturas: {error}
                    </div>
                )}

                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0" style={{ minWidth: '800px' }}>
                        <thead style={{ backgroundColor: '#fdfdfd' }}>
                            <tr>
                                {['ID FACTURA', 'CLIENTE', 'EMISIÓN', 'MONTO', 'ESTADO', 'ACCIONES'].map((col, i) => (
                                    <th key={col}
                                        className={`py-4 px-4 border-bottom text-muted fw-bold${i === 5 ? ' text-end' : ''}`}
                                        style={{ fontSize: '0.7rem', letterSpacing: '1.5px' }}
                                    >
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="border-top-0">
                            {loadingFacturas ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        {Array.from({ length: 6 }).map((_, j) => (
                                            <td key={j} className="px-4 py-3">
                                                <div style={{ height: 16, borderRadius: 6, background: '#f3f4f6', width: '80%' }} />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : facturas.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center text-muted py-5" style={{ fontSize: 14 }}>
                                        {busqueda || fechaFiltro
                                            ? 'No se encontraron facturas para los filtros aplicados.'
                                            : 'No hay facturas que coincidan con el estado seleccionado.'
                                        }
                                    </td>
                                </tr>
                            ) : (
                                facturas.map(factura => (
                                    <FilaFactura
                                        key={factura.id}
                                        factura={factura}
                                        onEstadoActualizado={onEstadoActualizado}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINACIÓN E INDICADORES DE FILTRO */}
                <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-3 p-4 border-top text-muted" style={{ fontSize: '0.85rem' }}>
                    <span className="d-flex flex-wrap align-items-center gap-2">
                        Mostrando {facturas.length} de {paginacion.totalResultados || 0} facturas

                        {/* Badges visuales para que el usuario sepa qué filtros tiene activos */}
                        {filtroEstado && <span className="badge bg-dark fw-normal px-2 py-1">{filtroEstado}</span>}
                        {busqueda && <span className="badge bg-secondary fw-normal px-2 py-1">"{busqueda}"</span>}
                        {fechaFiltro && <span className="badge bg-info text-dark fw-normal px-2 py-1">
                            <i className="bi bi-calendar me-1"></i> {formatearFechaBadge(fechaFiltro)}
                        </span>}
                    </span>
                    <Paginacion
                        paginaActual={paginaActual}
                        cambiarPagina={cambiarPagina}
                        tienePaginaAnterior={paginacion.tienePaginaAnterior}
                        tienePaginaSiguiente={paginacion.tienePaginaSiguiente}
                    />
                </div>
            </div>
        </div>
    );
};