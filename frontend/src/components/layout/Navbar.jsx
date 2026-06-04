import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../style/home.css";
import "../../style/navbar.css";
import { useAuth } from "../../context/AuthContext";
import { CarritoContext } from "../../context/CarritoContext";
import { useApi } from "../../hooks/useApi";
import { ProductSearchCard } from "../productos/ProductSearchCard";

export default function Navbar() {
    const [menu, setMenu] = useState(false);
    const [userMenu, setUserMenu] = useState(false);
    const [search, setSearch] = useState("");
    const [products, setProducts] = useState([]);

    // Cambiamos "user" por "usuario" para que coincida con tu contexto
    const { estaAutenticado, logout, usuario } = useAuth();
    const { cartItems, cartCount } = useContext(CarritoContext);
    const navigate = useNavigate();

    const manejarCerrarSesion = async () => {
        await logout();
        setUserMenu(false);
        navigate("/");
    };

    const { ejecutarPeticion } = useApi();
    const endpoint = "productos/productos";
    const query = search ? `?busqueda=${search}` : "";
    const finalEndopoint = endpoint.concat(query);

    const toggleMenu = () => setMenu(!menu);
    const toggleUserMenu = () => setUserMenu(!userMenu);

    const cerrarMenus = () => {
        setMenu(false);
        setUserMenu(false);
    };

    useEffect(() => {
        const buscarProducto = async () => {
            const resultado = await ejecutarPeticion(finalEndopoint, {
                method: "GET",
            });
            if (resultado.exito) {
                setProducts(resultado.data);
            }
        };
        if (search) {
            buscarProducto();
        }
    }, [search]);

    const letraInicial = usuario?.nombre ? usuario.nombre.charAt(0).toUpperCase() : 'U';

    return (
        <> {/* Fragmento padre: fundamental para que los paneles no se rompan con el sticky-top */}
            <nav className="navbar sticky-top border-bottom px-3 px-md-5 custom-navbar">
                <div className="container-fluid px-0 d-flex justify-content-between align-items-center">

                    {/* --- LADO IZQUIERDO --- */}
                    <div className="d-flex align-items-center">
                        <Link to="/" className="navbar-brand fw-bold fs-5 m-0 custom-nav-logo">
                            AirMobile
                        </Link>
                    </div>

                    {/* --- LADO DERECHO --- */}
                    <div className="d-flex align-items-center gap-3">

                        {/* BUSCADOR */}
                        <div className="search-container mb-1 d-none d-sm-block">
                            <input
                                type="text"
                                placeholder="Buscar..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="navbar-search"
                            />
                            {search && (
                                <div className="search-dropdown shadow-sm">
                                    {products?.data?.length > 0 ? (
                                        products.data.map((product) => (
                                            <ProductSearchCard
                                                nombre_producto={product.nombre_producto}
                                                id={product.id}
                                                image_url={product.imagen_url[0]}
                                                key={product.id}
                                                onClick={() => setSearch("")}
                                            />
                                        ))
                                    ) : (
                                        <div className="search-empty text-muted p-2 text-center">
                                            No se encontraron productos
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* CARRITO */}
                        <Link to={estaAutenticado ? "/carrito" : "/inicio-sesion"} className="position-relative text-dark me-2">
                            <i className="bi bi-cart fs-4 text-dark"></i>
                            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary" style={{ fontSize: "0.65rem", padding: "0.3em 0.45em" }}>
                                {cartCount > 0 ? cartCount : 0}
                            </span>
                        </Link>

                        {/* BOTÓN DEL AVATAR */}
                        {estaAutenticado ? (
                            <button
                                onClick={toggleUserMenu}
                                className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center p-0 shadow-sm"
                                style={{ width: "38px", height: "38px", fontWeight: "bold", border: "none" }}
                            >
                                {letraInicial}
                            </button>
                        ) : (
                            <Link to="/inicio-sesion" className="text-dark">
                                <i className="bi bi-person fs-4"></i>
                            </Link>
                        )}
                    </div>
                </div>
            </nav>

            {/* PANEL LATERAL DERECHO */}
            {(menu || userMenu) && <div className="sidebar-overlay" onClick={cerrarMenus}></div>}
            <div className={`sidebar-user ${userMenu ? "open" : ""}`}>
                <div className="p-4 border-bottom bg-light d-flex justify-content-between align-items-start">
                    <div>
                        {/* Usamos 'usuario' para mostrar los datos */}
                        <span className="fw-bold fs-5 d-block text-truncate">{usuario?.nombre || "Usuario"}</span>
                        <small className="text-muted d-block text-truncate">{usuario?.email}</small>
                    </div>
                    <i className="bi bi-x fs-2 text-dark" onClick={toggleUserMenu} style={{ cursor: "pointer" }}></i>
                </div>

                <ul className="navbar-nav p-3">
                    <li className="nav-item mb-2">
                        <Link to="/" className="nav-link text-dark py-2 d-flex align-items-center" onClick={toggleUserMenu}>
                            <i className="bi bi-house-door fs-5 me-3 text-primary"></i> Inicio
                        </Link>
                    </li>
                    <li className="nav-item mb-2">
                        <Link to="/catalogo" className="nav-link text-dark py-2 d-flex align-items-center" onClick={toggleUserMenu}>
                            <i className="bi bi-grid fs-5 me-3 text-primary"></i> Catálogo
                        </Link>
                    </li>
                    <li className="nav-item mb-2">
                        <Link to="/perfil-usuario" className="nav-link text-dark py-2 d-flex align-items-center" onClick={toggleUserMenu}>
                            <i className="bi bi-person fs-5 me-3 text-primary"></i> Mi Perfil
                        </Link>
                    </li>

                    {/* Verificación de rol con 'usuario' */}
                    {usuario?.rol === 'admin' && (
                        <li className="nav-item mb-2">
                            <Link to="/admin" className="nav-link text-dark py-2 d-flex align-items-center" onClick={toggleUserMenu}>
                                <i className="bi bi-shield-lock fs-5 me-3 text-warning"></i> Panel de Control
                            </Link>
                        </li>
                    )}
                </ul>

                <div className="p-3 border-top mt-auto" style={{ position: "absolute", bottom: "0", width: "100%" }}>
                    <button
                        className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center"
                        onClick={manejarCerrarSesion}
                    >
                        <i className="bi bi-box-arrow-right me-2"></i> Cerrar Sesión
                    </button>
                </div>
            </div>
        </>
    );
}