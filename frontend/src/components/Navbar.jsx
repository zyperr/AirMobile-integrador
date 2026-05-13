import { Link } from "react-router-dom";
import "../style/home.css";


export default function Navbar({ carrito = [] }) {

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
                    <li className="nav-item">
                        <a href="#" className="nav-link custom-nav-link active">iPhones</a>
                    </li>
                    <li className="nav-item">
                        <a href="#" className="nav-link custom-nav-link">Fundas</a>
                    </li>
                    <li className="nav-item">
                        <a href="#" className="nav-link custom-nav-link">Cargadores</a>
                    </li>
                    <li className="nav-item">
                        <a href="#" className="nav-link custom-nav-link">Audio</a>
                    </li>
                </ul>

                {/* ICONOS */}
                <div className="d-flex align-items-center gap-3">
                    <span style={{ cursor: "pointer" }}>
                        <i className="bi bi-search fs-5 text-dark"></i>
                    </span>
                    <span style={{ cursor: "pointer" }}>
                        <i className="bi bi-person fs-5 text-dark"></i>
                    </span>
                    
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
        </nav>
    );
}