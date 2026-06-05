import React from 'react';
import { BtnAccion } from '../common/BtnAccion'; // Ajustar ruta

export const FilaAdministrador = ({ activo,nombre,email,rol}) => {
    const isActive = activo === 1;

    // Función para obtener las iniciales del nombre
    const getIniciales = (nombreCompleto) => {
        const partes = nombreCompleto?.trim().split(' ');
        if (partes?.length >= 2) {
            return (partes[0][0] + partes[1][0]).toUpperCase();
        }
        return partes[0]?.substring(0, 2)?.toUpperCase();
    };

    // Color condicional del avatar basado en si está activo o no
    const colorAvatar = isActive ? 'bg-primary' : 'bg-secondary opacity-50';
    // Efecto grisado en toda la fila
    const opacidadFila = isActive ? 'opacity-100' : 'opacity-50 bg-light';

    return (
        <tr className={opacidadFila}>
            {/* NOMBRE Y AVATAR */}
            <td className="px-4 py-3">
                <div className="d-flex align-items-center gap-3">
                    <div 
                        className={`text-white rounded-circle d-flex align-items-center justify-content-center fw-bold ${colorAvatar}`} 
                        style={{ width: '40px', height: '40px', fontSize: '0.9rem' }}
                    >
                        {nombre ? getIniciales(nombre) : "AD" }
                    </div>
                    <span className="fw-semibold text-dark">{nombre}</span>
                </div>
            </td>

            {/* CORREO */}
            <td className="px-4 py-3 text-muted">
                {email}
            </td>
            {/* ESTADO (Con el circulito de la imagen) */}
            <td className="px-4 py-3">
                {isActive ? (
                    <span className="text-success fw-medium d-flex align-items-center gap-2">
                        <span style={{ fontSize: '0.6rem' }}>●</span> Activo
                    </span>
                ) : (
                    <span className="text-muted fw-medium d-flex align-items-center gap-2">
                        <span style={{ fontSize: '0.6rem' }}>●</span> Deshabilitado
                    </span>
                )}
            </td>

            {/* ACCIONES (Usando tu componente BtnAccion) */}
            <td className="px-4 py-3 text-end">
                <div className="d-flex gap-2 justify-content-end">
                    {isActive ? (
                        <>
                            <BtnAccion 
                                textoDefault="" 
                                iconoDefault="bi-unlock" 
                                colorDefault="btn-light text-warning border-0" 
                                isFullWidth={false}
                                title="Resetear Contraseña"
                            />
                            <BtnAccion 
                                textoDefault="" 
                                iconoDefault="bi-pencil" 
                                colorDefault="btn-light text-primary border-0" 
                                isFullWidth={false}
                                title="Editar"
                            />
                            <BtnAccion 
                                textoDefault="" 
                                iconoDefault="bi-trash" 
                                colorDefault="btn-light text-danger border-0" 
                                isFullWidth={false}
                                title="Deshabilitar"
                            />
                        </>
                    ) : (
                        <BtnAccion 
                            textoDefault="Restaurar" 
                            iconoDefault="bi-arrow-counterclockwise" 
                            colorDefault="btn-outline-success" 
                            isFullWidth={false}
                            className="btn-sm px-3"
                        />
                    )}
                </div>
            </td>
        </tr>
    );
};