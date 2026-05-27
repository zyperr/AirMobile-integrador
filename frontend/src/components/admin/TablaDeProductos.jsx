
// Muestra: imagen, nombre, variante, badge de estado y precio

import BadgeEstado from "../common/BadgeEstado"
// Datos de ejemplo — después se reemplaza por datos reales de la API
const productosEjemplo = [
    {
        id: 1,
        nombre: "iPhone 15 Pro",
        variante: "Natural Titanium, 256GB",
        estado: "Nuevo",
        precio: 999.00,
        imagen: "img/iPhone 13 Pro.jpg",
    },
    {
        id: 2,
        nombre: "iPhone 14",
        variante: "Midnight, 128GB",
        estado: "Reacondicionado",
        precio: 799.00,
        imagen: "img/iPhone 13 Pro.jpg",
    },
    {
        id: 3,
        nombre: "iPhone 13 mini",
        variante: "Starlight, 256GB",
        estado: "Usado",
        precio: 599.00,
        imagen: "img/iPhone 13 Pro.jpg",
    },
];

const TablaProductos = () => {
    return (
        <div className="tabla-card">

            {/* Encabezado*/}
            <div className="tabla-header d-flex align-items-center justify-content-between">
                <h2 className="tabla-titulo">Productos Activos</h2>
                <div className="d-flex gap-2">
                    <button className="tabla-icono-btn" title="Filtrar">
                        <i className="bi bi-filter" />
                    </button>
                    <button className="tabla-icono-btn" title="Ordenar">
                        <i className="bi bi-sort-down" />
                    </button>
                </div>
            </div>

            <div className="tabla-columnas d-flex">
                <span className="tabla-col-nombre">NOMBRE DEL PRODUCTO</span>
                <span className="tabla-col-estado">ESTADO</span>
                <span className="tabla-col-precio">PRECIO</span>
            </div>

            {/* Fila de productos usando Ejemplo */}
            {productosEjemplo.map((producto) => (
                <div key={producto.id} className="tabla-fila d-flex align-items-center">

                    {/* Imagen + nombre + variante */}
                    <div className="tabla-col-nombre d-flex align-items-start gap-3">
                        <img
                            src={producto.imagen}
                            alt={producto.nombre}
                            className="tabla-imagen"
                        />
                        <div>
                            <p className="tabla-producto-nombre">{producto.nombre}</p>
                            <p className="tabla-producto-variante">{producto.variante}</p>
                        </div>
                    </div>

                    {/* Badge de estado — reutilizamos BadgeEstado */}
                    <div className="tabla-col-estado">
                        <BadgeEstado estado={producto.estado} />
                    </div>

                    {/* Precio */}
                    <div className="tabla-col-precio">
                        <span className="tabla-precio">${producto.precio.toFixed(2)}</span>
                    </div>

                </div>
            ))}

            {/* LINK VER TODOS */}
            <div className="tabla-footer">
                <button className="tabla-ver-todos">Ver todos los productos</button>
            </div>

        </div>
    );
};

export default TablaProductos;