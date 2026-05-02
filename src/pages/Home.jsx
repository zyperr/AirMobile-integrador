import { Link } from "react-router-dom";
import "../style/home.css";

export default function Home() {
  return (
    <div>

      {/* NAV */}
      <nav>
        <a className="nav-logo">AirMobile</a>

        <ul className="nav-links">
          <li><a className="active">iPhones</a></li>
          <li><a>Fundas</a></li>
          <li><a>Cargadores</a></li>
          <li><a>Audio</a></li>
        </ul>

        <div className="nav-icons">
          <div className="cart-wrapper">
            🛒 <span className="cart-badge">0</span>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-text">
          <h1>
            Tu próximo<br />iPhone,<br />al mejor precio.
          </h1>
          <p>
            Equipos nuevos y reacondicionados con garantía de 12 meses.
          </p>

          <div className="hero-buttons">
            <button className="btn-primary">Ver Catálogo</button>
            <button className="btn-secondary">Conocer más</button>
          </div>
        </div>

        <div className="hero-image">
          <img src="/img/iPhone 13 Pro Sierra Blue.jpg" alt="iPhone" />
        </div>
      </section>

      {/* TRUST BAR */}
      <div className="trust-bar">
        <div className="trust-item">ENVIO GRATIS</div>
        <div className="trust-item">GARANTIA</div>
        <div className="trust-item">EQUIPO PROBADO</div>
        <div className="trust-item">PAGO SEGURO</div>
      </div>

      {/* PRODUCTOS */}
      <section className="products-section">
        <div className="products-header">
          <h2>Los más buscados</h2>
        </div>

        <div className="products-grid">

          <Link to="/product" style={{ textDecoration: "none", color: "inherit" }}>
            <div className="product-card">
              <div className="product-img">
                <img src="/img/iPhone 13 Pro.jpg" alt="iPhone 13" />
              </div>
              <span className="badge badge-reacondicionado">Reacondicionado</span>
              <div className="product-name">iPhone 13 Pro</div>
              <div className="product-price">$849.00</div>
            </div>
          </Link>

          <div className="product-card">
            <div className="product-img">
              <img src="/img/iPhone 15 Case.jpg" alt="Case" />
            </div>
            <span className="badge badge-accesorio">Accesorio</span>
            <div className="product-name">Silicone Case</div>
            <div className="product-price">$49.00</div>
          </div>

          <div className="product-card">
            <div className="product-img">
              <img src="/img/Cargador-Iphone.png" alt="Cargador" />
            </div>
            <span className="badge badge-energia">Energía</span>
            <div className="product-name">Cargador</div>
            <div className="product-price">$19.00</div>
          </div>

          <div className="product-card">
            <div className="product-img">
              <img src="/img/iPhone 12 Pro.png" alt="iPhone 12" />
            </div>
            <span className="badge badge-reacondicionado">Reacondicionado</span>
            <div className="product-name">iPhone 12</div>
            <div className="product-price">$549.00</div>
          </div>

        </div>
      </section>

      {/* GARANTIA */}
      <section className="guarantee-section">
        <div className="guarantee-image">
          <img src="/img/Img-Garantia.jpg" alt="Garantía" />
        </div>

        <div className="guarantee-text">
          <h2>Garantía de Excelencia</h2>
          <p>Cada dispositivo es inspeccionado en 40 puntos.</p>
          <button className="btn-dark">Ver Productos</button>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-content">
          <div className="footer-section">
            <h3>AirMobile</h3>
            <p>© 2026</p>
          </div>
        </div>
      </footer>

    </div>
  );
}