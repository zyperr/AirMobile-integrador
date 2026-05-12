import { Link } from "react-router-dom";
import "../style/home.css";



export default function Navbar({ carrito = [] }) {

    return (
        <nav>
            <Link to="/" className="nav-logo">
                AirMobile
            </Link>

            <ul className="nav-links d-flex align-items-center">
                <li><a href="#" className="active">iPhones</a></li>
                <li><a href="#">Fundas</a></li>
                <li><a href="#">Cargadores</a></li>
                <li><a href="#">Audio</a></li>
            </ul>
            <div className="nav-icons">
                <span>
                    <i class="bi bi-search"></i>
                </span>
                <span>
                    <i class="bi bi-person"></i>
                </span>
                <div className="cart-wrapper">
                    <span>
                        <i class="bi bi-cart"></i>
                    </span>
                    {carrito.length > 0 && <span className="cart-badge">{carrito.length}</span> || <span className="cart-badge">0</span>}
                </div>
            </div>
        </nav>


    )
}