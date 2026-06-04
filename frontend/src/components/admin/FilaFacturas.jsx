import React from 'react';

export const FilaFactura = ({ factura }) => {
    const badgeStyles = {
        PAGADA: 'bg-success bg-opacity-10 text-success',
        PENDIENTE: 'bg-warning bg-opacity-10 text-warning',
        VENCIDA: 'bg-danger bg-opacity-10 text-danger'
    };

    const estiloEstado = badgeStyles[factura.estado] || 'bg-secondary bg-opacity-10 text-secondary';

    const getIniciales = (nombreCompleto) => {
        const partes = nombreCompleto.trim().split(' ');
        if (partes.length >= 2) {
            return (partes[0][0] + partes[1][0]).toUpperCase();
        }
        return partes[0].substring(0, 2).toUpperCase();
    };

    return (
        <tr className="align-middle">
            <td className="px-4 py-3 py-md-4">
                <span className="fw-semibold text-dark">{factura.idFactura}</span>
            </td>

            <td className="px-4 py-3 py-md-4">
                <div className="d-flex align-items-center gap-3">
                    <div
                        className="text-secondary bg-light rounded-circle d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                        style={{ width: '35px', height: '35px', fontSize: '0.8rem' }}
                    >
                        {getIniciales(factura.cliente)}
                    </div>
                    <span className="text-secondary text-nowrap">{factura.cliente}</span>
                </div>
            </td>

            <td className="px-4 py-3 py-md-4 text-secondary text-nowrap">
                {factura.emision}
            </td>

            <td className="px-4 py-3 py-md-4">
                <span className="fw-bold text-dark">{factura.monto}</span>
            </td>

            <td className="px-4 py-3 py-md-4">
                <span className={`badge rounded-pill px-3 py-2 fw-semibold ${estiloEstado}`} style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                    {factura.estado}
                </span>
            </td>

            <td className="px-4 py-3 py-md-4 text-end">
                <button className="btn btn-light text-secondary border-0 rounded-circle" title="Descargar Factura">
                    <i className="bi bi-download"></i>
                </button>
            </td>
        </tr>
    );
};