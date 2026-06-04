//Componente de la barra lateral de la izquierda de Administrador
import { useState } from "react";


const SidebarAdmin = ({menuitems,setTabs}) => {

    const [activo, setActivo] = useState(1);

    // Lista de items del menu principal con su iconos.


    return (
        <aside className="sidebar-admin d-flex flex-column">
            {/* Navegacion Principal */}
            <nav className="sidebar-nav flex-grow-1">
                <ul className="list-unstyled" style={{ marginTop: "60px" }}>
                    {menuitems.map(({ nombre, icono, id }) => (
                        <li key={`${id}-${nombre}`}>
                            <button
                                className={`sidebar-item ${activo === id ? "sidebar-item-activo" : ""}`}
                                onClick={() => {setActivo(id),setTabs(id)}}
                            >
                                <i className={`bi ${icono} sidebar-icono`} />
                                {nombre}
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
                </ul>
            </div>

        </aside>
    );
}

export default SidebarAdmin;