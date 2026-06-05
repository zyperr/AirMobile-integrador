import React from 'react';
import { FilaAdministrador } from './FilaAdministrador';

export const ListaAdministradores = ({ administradores }) => {
    return (
        <div className="bg-white rounded-4 shadow-sm border-0 overflow-hidden">
            <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                    <thead style={{ backgroundColor: '#fdfdfd' }}>
                        <tr>
                            <th className="py-3 px-4 border-bottom text-muted fw-semibold" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>NOMBRE</th>
                            <th className="py-3 px-4 border-bottom text-muted fw-semibold" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>CORREO</th>
                            <th className="py-3 px-4 border-bottom text-muted fw-semibold" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>ESTADO</th>
                            <th className="py-3 px-4 border-bottom text-muted fw-semibold text-end" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>ACCIONES</th>
                        </tr>
                    </thead>
                    <tbody className="border-top-0">
                        {administradores.map(({id,activo,nombre,email}) => (
                            <FilaAdministrador key={id} activo={activo} nombre={nombre} email={email}   />
                        ))}
                    </tbody>
                </table>
            </div>
            
            {/* FOOTER PAGINACIÓN (Falso por ahora visualmente) */}
            <div className="d-flex align-items-center justify-content-between p-4 border-top text-muted" style={{ fontSize: '0.85rem' }}>
                <span>Mostrando {administradores.length} de 24 administradores</span>
                <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-secondary px-3">&lt;</button>
                    <button className="btn btn-sm btn-outline-secondary px-3">&gt;</button>
                </div>
            </div>
        </div>
    );
};