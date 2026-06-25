import { NavLink } from "react-router-dom";

const SidebarAdmin = ({ menuitems, isCollapsed, toggleSidebar }) => {

    return (
        <aside className={`sidebar-admin d-flex flex-column ${isCollapsed ? "collapsed" : ""}`}>
            
            {/* Botón para colapsar/expandir el sidebar */}
            <div className="d-flex justify-content-end p-2">
                <button 
                    onClick={toggleSidebar} 
                    className="btn btn-sm btn-light border-0 text-muted shadow-sm"
                    title={isCollapsed ? "Expandir menú" : "Contraer menú"}
                >
                    <i className={`bi ${isCollapsed ? "bi-chevron-right" : "bi-chevron-left"}`} />
                </button>
            </div>

            <nav className="sidebar-nav flex-grow-1">
                {/* Reduje el marginTop de 60px a 20px para que quede más cerca del botón */}
                <ul className="list-unstyled" style={{ marginTop: "20px" }}>
                    {menuitems.map(({ nombre, icono, path }) => (
                        <li key={`${path}-${nombre}`}>
                            <NavLink
                                to={`/admin/${path}`}
                                className={({ isActive }) => 
                                    `sidebar-item text-decoration-none d-flex align-items-center ${isActive ? "sidebar-item-activo" : ""}`
                                }
                                title={isCollapsed ? nombre : ""} // Muestra tooltip con el nombre si está cerrado
                            >
                                <i className={`bi ${icono} sidebar-icono fs-5 ${isCollapsed ? "mx-auto m-0" : "me-2"}`} />
                                {!isCollapsed && <span className="sidebar-text">{nombre}</span>}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

        </aside>
    );
}

export default SidebarAdmin;