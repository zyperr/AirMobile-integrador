import BadgeEstado from "../common/BadgeEstado";

export const ProductosFila = ({ id, imagen_url, nombre_producto, condicion, precio, activo = 1, onEliminar, onEditar, onRestaurar }) => {
    const estaActivo = activo === 1;

    return (
        <>
            <div className={`tabla-fila d-flex align-items-center ${!estaActivo ? "tabla-fila-inactiva" : ""}`}>

                <div className="tabla-col-nombre d-flex align-items-start gap-3">
                    <img src={imagen_url} alt={nombre_producto} className="tabla-imagen" />
                    <div>
                        <p className="tabla-producto-nombre">{nombre_producto}</p>
                    </div>
                </div>

                <div className="tabla-col-estado">
                    <BadgeEstado estado={condicion} />
                </div>

                <div className="tabla-col-precio">
                    <span className="tabla-precio">${Number(precio || 0).toFixed(2)}</span>
                </div>

                <div className="tabla-col-acciones d-flex gap-2">
                    {estaActivo ? (
                        <>
                            <button className="tabla-btn-editar" onClick={() => onEditar(id)} title="Editar producto">
                                <i className="bi bi-pencil" />
                            </button>
                            <button className="tabla-btn-eliminar" onClick={() => onEliminar(id)} title="Eliminar producto">
                                <i className="bi bi-trash" />
                            </button>
                        </>
                    ) : (
                        <button className="tabla-btn-restaurar" onClick={() => onRestaurar(id)} title="Restaurar producto">
                            <i className="bi bi-arrow-counterclockwise" />
                        </button>
                    )}
                </div>

            </div>
        </>
    );
};