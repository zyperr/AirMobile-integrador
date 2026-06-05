import { NavLink } from "react-router-dom";

const SidebarAdmin = ({ menuitems }) => {

    return (
        <aside className="sidebar-admin d-flex flex-column">
            <nav className="sidebar-nav flex-grow-1">
                <ul className="list-unstyled" style={{ marginTop: "60px" }}>
                    {menuitems.map(({ nombre, icono, path }) => (
                        <li key={`${path}-${nombre}`}>
                            <NavLink
                                to={`/admin/${path}`}
                                className={({ isActive }) => 
                                    `sidebar-item text-decoration-none d-block ${isActive ? "sidebar-item-activo" : ""}`
                                }
                            >
                                <i className={`bi ${icono} sidebar-icono`} />
                                {nombre}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="sidebar-footer">
                <ul className="list-unstyled mt-3 m-0">
                    <li>
                        <button className="sidebar-link bg-transparent border-0">
                            <i className="bi bi-question-circle me-2" />Centro de Ayuda
                        </button>
                    </li>
                </ul>
            </div>

        </aside>
    );
}

export default SidebarAdmin;