import BadgeEstado from "../common/BadgeEstado";

export const ProductosFila = ({ id, imagen_url, nombre_producto, condicion, precio, onEliminar, onEditar }) => {
    return (
        <>
            {/* Borramos el key de acá adentro porque ya se lo pasamos desde el map en TablaProductos */}
            <div className="tabla-fila d-flex align-items-center">

                {/* Imagen + nombre + variante */}
                <div className="tabla-col-nombre d-flex align-items-start gap-3">
                    <img
                        src={imagen_url} // Usamos la variable directa
                        alt={nombre_producto} // Usamos la variable directa
                        className="tabla-imagen"
                    />
                    <div>
                        <p className="tabla-producto-nombre">{nombre_producto}</p>
                    </div>
                </div>

                {/* Badge de estado */}
                <div className="tabla-col-estado">
                    <BadgeEstado estado={condicion} />
                </div>

                {/* Precio */}
                <div className="tabla-col-precio">
                    <span className="tabla-precio">${Number(precio || 0).toFixed(2)}</span>
                </div>

                {/* Botones de Acciones */}
                <div className="tabla-col-acciones d-flex gap-2">
                    <button
                        className="tabla-btn-editar"
                        onClick={() => onEditar(id)}
                        title="Editar producto"
                    >
                    <i className="bi bi-pencil" />
                    </button>
                    <button
                        className="tabla-btn-eliminar"
                        onClick={() => onEliminar(id)}
                        title="Eliminar producto"
                    >
                    <i className="bi bi-trash" />
                    </button>
                </div>

            </div>
        </>
    );
};