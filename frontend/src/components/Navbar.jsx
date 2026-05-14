import { useState, useEffect } from "react";
import { data, Link, useNavigate } from "react-router-dom";
import "../style/home.css";
import "../style/navbar.css";
import { useAuth } from "../context/AuthContext";
import { useApi } from "../hooks/useApi";
import { ProductSearchCard } from "./ProductSearchCard";


export default function Navbar({ carrito = [] }) {

    const [menu, setMenu] = useState(false);
    const [search, setSearch] = useState("");
    const [products, setProducts] = useState([])
    const { estaAutenticado, logout } = useAuth();


    const navigate = useNavigate(); // Hook de React Router para cambiar de página

    // Función para manejar el clic en "Cerrar Sesión"
    const manejarCerrarSesion = () => {
        logout(); // Esto borra el token del contexto y del localStorage
        navigate("/"); // Redirige al usuario al inicio
    };

    const { ejecutarPeticion, isLoading, error } = useApi();

    const endpoint = "productos/productos";

    const query = search ? `?busqueda=${search}` : ""

    const finalEndopoint = endpoint.concat(query)
     
    
    const toggleMenu = () => {
        setMenu(!menu);
    };

    
    useEffect(() => {

        const buscarProducto = async () => {
            const resultado = await ejecutarPeticion(finalEndopoint, {
                method: "GET",
            })
            if (resultado.exito) {
                setProducts(resultado.data)
            }
        }
        buscarProducto()
        
    }, [search])


    return (
        <nav className="navbar sticky-top border-bottom px-4 px-md-5 custom-navbar">
            {/* Utilizamos clases de Bootstrap para la posición y flexbox */}
            <div className="container-fluid px-0 d-flex justify-content-between align-items-center">

                {/* LOGO */}
                <Link to="/" className="navbar-brand fw-bold fs-5 m-0 custom-nav-logo">
                    AirMobile
                </Link>

                {/* ENLACES (Ocultos en móviles, visibles desde pantallas medianas) */}
                <ul className="navbar-nav flex-row gap-4 d-none d-md-flex m-0 p-0">
                    <Link to="/" className="nav-link custom-nav-link">Inicio</Link>
                    <Link to="/catalogo" className="nav-link custom-nav-link">Catálogo</Link>
                </ul>

                {/* BOTÓN HAMBURGUESA (Visible solo en móviles) */}
                <div className="btn-ham d-md-none d-flex align-items-center me-3" onClick={toggleMenu} style={{ cursor: "pointer" }}>
                    <i className={`bi ${menu ? 'bi-x' : 'bi-list'} fs-4`}></i>
                </div>



                {/* ICONOS */}
                <div className="d-flex align-items-center gap-3">
                    <span style={{ cursor: "pointer" }}>

                        <div className="search-container me-5 me-sm-1  mb-1">

                            <input
                                type="text"
                                placeholder="Buscar..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="navbar-search"
                            />

                            {search && (
                                <div className="search-dropdown">

                                    {products.data.length > 0 ? (

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
                                        <div className="search-empty">
                                            No se encontraron productos
                                        </div>

                                    )}

                                </div>
                            )}

                        </div>

                    </span>

                    <span style={{ cursor: "pointer" }}>


                        <Link to={estaAutenticado ? "/perfil-usuario" : "/inicio-sesion"}>
                            <i className="bi bi-person fs-5 text-dark"></i>
                        </Link>
                    </span>

                  {estaAutenticado && (
                        // 2. EJECUTAMOS LA FUNCIÓN AL HACER CLIC (Ya no usamos Link)
                        <span style={{ cursor: "pointer" }} onClick={manejarCerrarSesion}>
                            <i className="bi bi-box-arrow-right fs-5 text-danger"></i> {/* Le puse text-danger para que quede rojito */}
                        </span>
                    )}

                    {/* CARRITO CON BURBUJA BOOTSTRAP */}
                    <div className="position-relative" style={{ cursor: "pointer" }}>
                        <i className="bi bi-cart fs-5 text-dark"></i>
                        {/* Clases mágicas de Bootstrap para el badge */}
                        <span
                            className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary"
                            style={{ fontSize: "0.65rem", padding: "0.3em 0.45em" }}
                        >
                            {carrito.length > 0 ? carrito.length : 0}
                        </span>
                    </div>
                </div>
            </div>
            {/* ENLACES MÓVILES (Se despliega hacia abajo) */}
            <div className={`mobile-menu d-md-none ${menu ? "active" : ""}`}>
                <ul className="navbar-nav p-3 border-top w-100">
                    <li className="nav-item"><a href="#" className="nav-link custom-nav-link py-2">iPhones</a></li>
                    <li className="nav-item"><a href="#" className="nav-link custom-nav-link py-2">Fundas</a></li>
                    <li className="nav-item"><a href="#" className="nav-link custom-nav-link py-2">Cargadores</a></li>
                    <li className="nav-item"><a href="#" className="nav-link custom-nav-link py-2">Audio</a></li>
                </ul>
            </div>
        </nav>
    );
}