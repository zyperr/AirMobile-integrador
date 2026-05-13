import { Link } from "react-router-dom";
import { useState } from "react";
import "../style/home.css";

export default function Home() {

  const [search, setSearch] = useState("");
  const [cart, setCart] = useState(0);

 

  return (
    <div>

      {/* NAV */}
      <nav>

        <a className="nav-logo">
          AirMobile
        </a>

        <ul className="nav-links">
          <li><a className="active">iPhones</a></li>
          <li><a>Fundas</a></li>
          <li><a>Cargadores</a></li>
          <li><a>Audio</a></li>
        </ul>

        <div className="nav-icons">

          {/* SEARCH */}


          {/* LOGIN */}
          <span className="nav-icon">
            👤
          </span>

          {/* CART */}
          <div className="cart-wrapper">
            🛒
            <span className="cart-badge">
              {cart}
            </span>
          </div>

        </div>

      </nav>

      {/* HERO */}
      <section className="hero">

        <div className="hero-text">

          <h1>
            Tu próximo
            <br />
            iPhone,
            <br />
            al mejor precio.
          </h1>

          <p>
            Equipos nuevos y reacondicionados con garantía de 12 meses.
          </p>

          <div className="hero-buttons">

            <button className="btn-primary">
              Ver Catálogo
            </button>

            <button className="btn-secondary">
              Conocer más
            </button>

          </div>

        </div>

        <div className="hero-image">

          <img
            src="/img/iPhone 13 Pro Sierra Blue.jpg"
            alt="iPhone"
          />

        </div>

      </section>

      {/* TRUST BAR */}
      <div className="trust-bar">

        <div className="trust-item">
          ENVIO GRATIS
        </div>

        <div className="trust-item">
          GARANTIA
        </div>

        <div className="trust-item">
          EQUIPO PROBADO
        </div>

        <div className="trust-item">
          PAGO SEGURO
        </div>

      </div>

      {/* PRODUCTOS */}
      <section className="products-section">

        <div className="products-header">
          <h2>Los más buscados</h2>
        </div>

        <div className="products-grid">

          {products.map((product, index) => (

            <Link
              key={index}
              to="/product"
              style={{
                textDecoration: "none",
                color: "inherit"
              }}
            >

              <div className="product-card">

                <div className="product-img">

                  <img
                    src={product.image}
                    alt={product.name}
                  />

                </div>

                <span className={`badge ${product.badgeClass}`}>
                  {product.badge}
                </span>

                <div className="product-name">
                  {product.name}
                </div>

                <div className="product-price">
                  {product.price}
                </div>

                <button
                  className="btn-primary"
                  style={{
                    width: "100%",
                    marginTop: "14px"
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    setCart(cart + 1);
                  }}
                >
                  Añadir
                </button>

              </div>

            </Link>

          ))}

        </div>

      </section>

      {/* GARANTIA */}
      <section className="guarantee-section">

        <div className="guarantee-image">

          <img
            src="/img/Img-Garantia.jpg"
            alt="Garantía"
          />

        </div>

        <div className="guarantee-text">

          <h2>
            Garantía de Excelencia
          </h2>

          <p>
            Cada dispositivo es inspeccionado en 40 puntos.
          </p>

          <button className="btn-dark">
            Ver Productos
          </button>

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