import React, { useState } from 'react';
import { TarjetaFactura } from './TarjetaFactura';
import { FilaFactura } from './FilaFacturas';

export const Facturas = () => {
    const [filtroActivo, setFiltroActivo] = useState('Todas');

    // MOCK DATA
    const mockFacturas = [
        { id: 1, idFactura: "INV-2024-001", cliente: "Alice Martins", emision: "12 Oct 2024", monto: "$1,240.00", estado: "PAGADA" },
        { id: 2, idFactura: "INV-2024-002", cliente: "Julio Dominguez", emision: "14 Oct 2024", monto: "$840.50", estado: "PENDIENTE" },
        { id: 3, idFactura: "INV-2024-003", cliente: "Studio Re-Fresh", emision: "08 Oct 2024", monto: "$3,120.00", estado: "VENCIDA" },
        { id: 4, idFactura: "INV-2024-004", cliente: "Lara Galarza", emision: "15 Oct 2024", monto: "$450.00", estado: "PAGADA" },
        { id: 5, idFactura: "INV-2024-005", cliente: "Tech Knights Co.", emision: "16 Oct 2024", monto: "$9,800.00", estado: "PENDIENTE" },
    ];

    const filtros = ['Todas', 'Pagadas', 'Pendientes', 'Vencidas'];

    return (
        <div className="container-fluid py-4 px-3 px-md-4" style={{ backgroundColor: '#f8f9fc', minHeight: '100vh' }}>

            {/* ENCABEZADO */}
            <div className="mb-4 mb-md-5 text-center text-md-start">
                <h1 className="fw-bold mb-2 fs-2 fs-md-1" style={{ color: '#111827' }}>Facturas</h1>
                <p className="text-muted mx-auto mx-md-0" style={{ fontSize: '1rem', maxWidth: '600px' }}>
                    Gestiona y supervisa todas las transacciones financieras y el estado de facturación de Air Mobile.
                </p>
            </div>

            {/* TARJETAS KPI */}
            <div className="row g-4 mb-4 mb-md-5">
                <div className="col-12 col-lg-4">
                    <TarjetaFactura
                        titulo="Total Facturado"
                        valor="$142,580"
                        extraTag="~ 12%"
                        extraTagColor="text-success"
                        iconoFooter="bi-calendar3"
                        textoFooter="Últimos 12 meses"
                    />
                </div>
                <div className="col-12 col-md-6 col-lg-4">
                    <TarjetaFactura
                        titulo="Pendientes de Pago"
                        valor="$24,310"
                        extraTag="18 facturas"
                        extraTagColor="text-warning"
                        iconoFooter="bi-clock"
                        textoFooter="Vencimiento promedio: 5 días"
                    />
                </div>
                <div className="col-12 col-md-6 col-lg-4">
                    <TarjetaFactura
                        titulo="Facturas del Mes"
                        valor="142"
                        extraTag="+ 8%"
                        extraTagColor="text-primary"
                        iconoFooter="bi-arrow-repeat"
                        textoFooter="Actualizado hace 5m"
                    />
                </div>
            </div>

            {/* BARRA DE FILTROS RESPONSIVE */}
            <div className="d-flex flex-column flex-xl-row justify-content-between align-items-xl-center gap-3 mb-4">

                {/* Píldoras de estado (Scrollable en móviles) */}
                <div className="w-100 overflow-x-auto pb-2 pb-xl-0" style={{ whiteSpace: 'nowrap' }}>
                    <div className="d-inline-flex gap-2 bg-white p-1 rounded-pill shadow-sm border border-light">
                        {filtros.map(filtro => (
                            <button
                                key={filtro}
                                onClick={() => setFiltroActivo(filtro)}
                                className={`btn rounded-pill px-3 px-md-4 py-2 fw-semibold border-0 ${filtroActivo === filtro ? 'btn-dark text-white' : 'btn-light text-muted bg-transparent'}`}
                                style={{ fontSize: '0.85rem' }}
                            >
                                {filtro}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Filtros derechos (Ancho completo en móviles) */}
                <div className="d-flex flex-wrap flex-sm-nowrap gap-2 w-100 w-xl-auto">
                    <button className="btn bg-white border shadow-sm rounded-3 fw-medium text-secondary d-flex justify-content-center align-items-center gap-2 px-3 py-2 flex-grow-1 flex-xl-grow-0">
                        <i className="bi bi-calendar-minus"></i> Este Mes <i className="bi bi-chevron-down ms-1"></i>
                    </button>
                    <button className="btn bg-white border shadow-sm rounded-3 fw-medium text-secondary d-flex justify-content-center align-items-center gap-2 px-3 py-2 flex-grow-1 flex-xl-grow-0">
                        <i className="bi bi-sliders"></i> Filtros
                    </button>
                </div>
            </div>

            {/* CONTENEDOR DE LA TABLA */}
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
                            {mockFacturas.map((factura) => (
                                <FilaFactura key={factura.id} factura={factura} />
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* PAGINACIÓN INFERIOR */}
                <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-3 p-4 border-top text-muted" style={{ fontSize: '0.85rem' }}>
                    <span className="text-center text-md-start">Mostrando 1-5 de 1,242 facturas</span>
                    <div className="d-flex align-items-center justify-content-center flex-wrap gap-1">
                        <button className="btn btn-sm btn-light text-muted border-0">&lt;</button>
                        <button className="btn btn-sm btn-primary rounded-circle" style={{ width: '32px', height: '32px' }}>1</button>
                        <button className="btn btn-sm btn-light text-muted border-0 rounded-circle" style={{ width: '32px', height: '32px' }}>2</button>
                        <button className="btn btn-sm btn-light text-muted border-0 rounded-circle d-none d-sm-inline-block" style={{ width: '32px', height: '32px' }}>3</button>
                        <span className="px-1 px-sm-2">...</span>
                        <button className="btn btn-sm btn-light text-muted border-0 rounded-circle" style={{ width: '32px', height: '32px' }}>124</button>
                        <button className="btn btn-sm btn-light text-muted border-0">&gt;</button>
                    </div>
                </div>
            </div>

        </div>
    );
};
