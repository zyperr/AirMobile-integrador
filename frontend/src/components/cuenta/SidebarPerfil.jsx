import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const SidebarPerfil = ({ datosUsuario }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const manejarCerrarSesion = () => {
        logout();
        navigate("/");
    };

    const menuitems = [
        { path: "informacion", nombre: "Información General", icono: "bi-person-circle" },
        { path: "seguridad", nombre: "Seguridad", icono: "bi-lock" },
        { path: "facturacion", nombre: "Facturación", icono: "bi-receipt" },
        { path: "deseos", nombre: "Lista de Deseos", icono: "bi-heart" }
    ];

    return (
        <aside className="col-12 col-md-3 col-lg-3 mb-4">
            <h4 className="fs-5 fw-bold mb-4 px-3">Mi Perfil</h4>
            <div className="d-flex flex-column gap-2">
                {menuitems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={`/perfil-usuario/${item.path}`}
                        className={({ isActive }) => 
                            `btn d-flex align-items-center justify-content-start border-0 fw-semibold px-3 py-2 text-start ${isActive ? 'btn-light text-primary' : 'btn-white text-secondary'}`
                        }
                    >
                        <i className={`bi ${item.icono} me-3`}></i> {item.nombre}
                    </NavLink>
                ))}
                <hr className="my-2" />
                <button className="btn btn-white text-danger d-flex align-items-center justify-content-start border-0 px-3 py-2 text-start mt-4" onClick={manejarCerrarSesion}>
                    <i className="bi bi-box-arrow-right me-3"></i> Cerrar Sesión
                </button>
            </div>
        </aside>
    );
};

export default SidebarPerfil;