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


        </aside>
    );
}

export default SidebarAdmin;