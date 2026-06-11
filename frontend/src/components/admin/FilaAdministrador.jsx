import { BtnAccion } from '../common/BtnAccion';

export const FilaAdministrador = ({ id, activo, nombre, email, rol, onDeshabilitar, onRestaurar, onResetPassword, onEditar }) => {

    const isActive = activo === 1;

    // Iniciales del nombre para el avatar
    const getIniciales = (nombreCompleto) => {
        const partes = nombreCompleto?.trim().split(' ');
        if (partes?.length >= 2) {
            return (partes[0][0] + partes[1][0]).toUpperCase();
        }
        return partes[0]?.substring(0, 2)?.toUpperCase();
    };

    const colorAvatar = isActive ? 'bg-primary' : 'bg-secondary opacity-50';
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
                        {nombre ? getIniciales(nombre) : "AD"}
                    </div>
                    <span className="fw-semibold text-dark">{nombre}</span>
                </div>
            </td>

            {/* CORREO */}
            <td className="px-4 py-3 text-muted">
                {email}
            </td>

            {/* ESTADO */}
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

            {/* ACCIONES */}
            <td className="px-4 py-3 text-end">
                <div className="d-flex gap-2 justify-content-end">
                    {isActive ? (
                        <>
                            {/* Resetear contraseña */}
                            <BtnAccion
                                textoDefault=""
                                iconoDefault="bi-unlock"
                                colorDefault="btn-light text-warning border-0"
                                isFullWidth={false}
                                title="Resetear Contraseña"
                                onClick={() => onResetPassword(id)}
                            />

                            {/* Editar — por ahora sin modal, se puede agregar después */}
                            <BtnAccion
                                textoDefault=""
                                iconoDefault="bi-pencil"
                                colorDefault="btn-light text-primary border-0"
                                isFullWidth={false}
                                title="Editar"
                                onClick={() => onEditar(id)}
                            />

                            {/* Deshabilitar */}
                            <BtnAccion
                                textoDefault=""
                                iconoDefault="bi-trash"
                                colorDefault="btn-light text-danger border-0"
                                isFullWidth={false}
                                title="Deshabilitar"
                                onClick={() => onDeshabilitar(id)}
                            />
                        </>
                    ) : (
                        /* Restaurar */
                        <BtnAccion
                            textoDefault="Restaurar"
                            iconoDefault="bi-arrow-counterclockwise"
                            colorDefault="btn-outline-success"
                            isFullWidth={false}
                            className="btn-sm px-3"
                            onClick={() => onRestaurar(id)}
                        />
                    )}
                </div>
            </td>

        </tr>
    );
};