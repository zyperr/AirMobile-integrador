//Componente de la barra lateral de la izquierda de Administrador
import { useState } from "react";


const SidebarAdmin = () => {

    const [activo,setActivo ] = useState("Inventario");

     // Lista de items del menu principal con su iconos.

    const menuitems = [
        {nombre: "Administracion", icono: "bi-grid" },
        {nombre: "inventario", icono: "bi-archive"},
        {nombre: "Ordenes", icono: "bi-cart3"},
    ];

    return (  
        <aside className="sidebar-admin d-flex flex-column">
            {/*Logo*/}
            <div className="sidebar-logo">
                <span className="sidebar-logo-texto">Air Mobile</span>
            </div>

            {/* Navegacion Principal */}
            <nav className="sidebar-nav flex-grow-1">
                <ul className="list-unstyled m-0">
                    {menuitems.map((item) => (
                        <li key={item.nombre}>
                            <button
                                className={`sidebar-item ${activo === item.nombre ? "sidebar-item-activo" : ""}`}
                                onClick={() => setActivo(item.nombre)}
                            >
                                <i className={`bi ${item.icono} sidebar-icono`} />
                                {item.nombre}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Boton de nuevo Producto */}
            <div className="sidebar-footer">
    

                {/* Links de abajo */}
                <ul className="list-unstyled mt-3 m-0">
                    <li>
                        <button className="sidebar-link">
                            <i className="bi bi-question-circle me-2" />Centro de Ayuda
                        </button>
                    </li>
                    <li>
                        <button className="sidebar-link sidebar-link-danger">
                            <i className="bi bi-box-arrow-right me-2" />Cerrar Cuenta
                        </button>
                    </li>
                </ul>
            </div>

        </aside>
    );
}

export default SidebarAdmin;