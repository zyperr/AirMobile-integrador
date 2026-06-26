import { useState, useRef, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';

const ESTADOS = ['Pendiente', 'Completado', 'Enviado', 'Cancelado', 'Reembolsado'];

const estadoConfig = {
    Pendiente:   { bg: '#fffbeb', color: '#92400e', border: '#fcd34d' },
    Completado:  { bg: '#f0fdf4', color: '#166534', border: '#86efac' },
    Enviado:     { bg: '#eff6ff', color: '#1e40af', border: '#93c5fd' },
    Cancelado:   { bg: '#fef2f2', color: '#991b1b', border: '#fca5a5' },
    Reembolsado: { bg: '#f9fafb', color: '#374151', border: '#d1d5db' },
};

export const FilaFactura = ({ factura, onEstadoActualizado }) => {
    const { ejecutarPeticion, isLoading } = useApi();
    const { token } = useAuth();
    const [descargando, setDescargando] = useState(false);
    const [menuAbierto, setMenuAbierto] = useState(false);
    const menuRef = useRef(null);

    const cfg = estadoConfig[factura.estado] || estadoConfig['Pendiente'];

    // Cerrar al hacer click afuera
    useEffect(() => {
        const handleClickAfuera = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuAbierto(false);
            }
        };
        document.addEventListener('mousedown', handleClickAfuera);
        return () => document.removeEventListener('mousedown', handleClickAfuera);
    }, []);

    const formatearFecha = (fecha) => {
        if (!fecha) return '—';
        return new Date(fecha + 'Z').toLocaleDateString('es-AR', {
            day: '2-digit', month: 'short', year: 'numeric',
            timeZone: 'America/Argentina/Buenos_Aires',
        });
    };

    const formatearIdFactura = (factura) => {
        const fecha = factura.fecha
            ? new Date(factura.fecha + 'Z').toISOString().slice(0, 10).replace(/-/g, '')
            : '00000000';
        return `INV-${factura.id}-${fecha}`;
    };

    const cambiarEstado = async (nuevoEstado) => {
        setMenuAbierto(false);
        const respuesta = await ejecutarPeticion(`facturas/actualizar-estado/${factura.id}`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ estado: nuevoEstado }),
        });
        if (respuesta.exito) onEstadoActualizado(factura.id, nuevoEstado);
    };

    const descargarPDF = async () => {
        setMenuAbierto(false);
        setDescargando(true);
        try {
            const response = await fetch(
                `http://localhost:3000/api/facturas/detalle-factura/${factura.id}/pdf`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (!response.ok) {
                alert('No se pudo generar el PDF.');
                return;
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${formatearIdFactura(factura)}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

        } catch (err) {
            console.error('Error al descargar PDF:', err);
            alert('Error de conexión al generar el PDF.');
        } finally {
            setDescargando(false);
        }
    };

    return (
        <tr>
            <td className="px-4 py-3 fw-semibold" style={{ fontSize: '0.85rem', color: '#1a3a6b' }}>
                {formatearIdFactura(factura)}
            </td>
            <td className="px-4 py-3" style={{ fontSize: '0.9rem' }}>
                {factura.nombre_cliente || '—'}
            </td>
            <td className="px-4 py-3 text-muted" style={{ fontSize: '0.9rem' }}>
                {formatearFecha(factura.fecha)}
            </td>
            <td className="px-4 py-3 fw-semibold" style={{ fontSize: '0.9rem' }}>
                ${Number(factura.total).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </td>
            <td className="px-4 py-3">
                <span style={{
                    background: cfg.bg, color: cfg.color,
                    border: `1px solid ${cfg.border}`,
                    borderRadius: 20, padding: '4px 12px',
                    fontSize: '0.75rem', fontWeight: 600,
                }}>
                    {factura.estado}
                </span>
            </td>
            <td className="px-4 py-3 text-end">
                <div ref={menuRef} style={{ position: 'relative', display: 'inline-block' }}>
                    <button
                        className="btn btn-sm btn-light border"
                        onClick={() => setMenuAbierto(v => !v)}
                        disabled={isLoading || descargando}
                    >
                        <i className={`bi ${isLoading || descargando ? 'bi-hourglass-split' : 'bi-three-dots'}`} />
                    </button>

                    {menuAbierto && (
                        <div style={{
                            position: 'absolute', right: 0, top: '110%', zIndex: 1050,
                            background: 'white', border: '1px solid #e5e7eb',
                            borderRadius: 10, boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                            minWidth: 190, padding: '6px 0'
                        }}>
                            {/* Descargar PDF */}
                            <button
                                onClick={descargarPDF}
                                style={{
                                    width: '100%', textAlign: 'left', background: 'none',
                                    border: 'none', padding: '8px 16px', fontSize: '0.85rem',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                                    color: '#374151'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                                onMouseLeave={e => e.currentTarget.style.background = 'none'}
                            >
                                <i className="bi bi-file-earmark-pdf" style={{ color: '#dc2626' }} />
                                {descargando ? 'Generando...' : 'Descargar PDF'}
                            </button>

                            <div style={{ borderTop: '1px solid #f3f4f6', margin: '4px 0' }} />

                            {/* Cambiar estado */}
                            <div style={{ padding: '4px 16px 4px', fontSize: 10, color: '#9ca3af', letterSpacing: 1, fontWeight: 600 }}>
                                CAMBIAR ESTADO
                            </div>
                            {ESTADOS.filter(e => e !== factura.estado).map(estado => (
                                <button
                                    key={estado}
                                    onClick={() => cambiarEstado(estado)}
                                    style={{
                                        width: '100%', textAlign: 'left', background: 'none',
                                        border: 'none', padding: '8px 16px', fontSize: '0.85rem',
                                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                                        color: '#374151'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                                >
                                    <span style={{
                                        width: 8, height: 8, borderRadius: '50%',
                                        background: estadoConfig[estado]?.border,
                                        display: 'inline-block', flexShrink: 0
                                    }} />
                                    {estado}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </td>
        </tr>
    );
};