import { React, useState } from "react";
import { Link } from "react-router-dom";
import "../style/home.css";
import "../style/navbar.css";


export default function Navbar({ carrito = [] }) {

    const [menu, setMenu] = useState(false);
    const [search, setSearch] = useState("");



    // Función para alternar el menú
    const toggleMenu = () => {
        setMenu(!menu);
    };

    const products = [
        {
            id: 1,
            name: "iPhone 13 Pro",
            price: "$849.00",
            image: "/img/iPhone 13 Pro.jpg",
            badge: "Reacondicionado",
            badgeClass: "badge-reacondicionado"
        },
        {
            id: 2,
            name: "Silicone Case",
            price: "$49.00",
            image: "/img/iPhone 15 Case.jpg",
            badge: "Accesorio",
            badgeClass: "badge-accesorio"
        },
        {
            id: 3,
            name: "Cargador USB-C",
            price: "$19.00",
            image: "/img/Cargador-Iphone.png",
            badge: "Energía",
            badgeClass: "badge-energia"
        },
        {
            id: 4,
            name: "iPhone 12 Pro",
            price: "$549.00",
            image: "/img/iPhone 12 Pro.png",
            badge: "Reacondicionado",
            badgeClass: "badge-reacondicionado"
        }
    ];

    const filteredProducts = products.filter((product) =>
        product.name
            .toLowerCase()
            .includes(search.toLowerCase())
    );

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

                                    {filteredProducts.length > 0 ? (

                                        filteredProducts.map((product) => (

                                            <div
                                                key={product.id}
                                                className="search-item"
                                            >

                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                />

                                                <span>
                                                    {product.name}
                                                </span>

                                            </div>

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

                        <Link to="/inicio-sesion">
                            <i className="bi bi-person fs-5 text-dark"></i>
                        </Link>
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