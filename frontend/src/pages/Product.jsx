import { useState } from "react";
import Navbar from "../components/Navbar.jsx";


import "../style/home.css";
import "../style/detalleProducto.css";
import Footer from "../components/Footer.jsx";



export default function Product() {
  const [condicion, setCondicion] = useState("Como nuevo");
  const [capacidad, setCapacidad] = useState("128GB");
  const [carrito, setCarrito] = useState([]);

  const agregarAlCarrito = () => {
    const producto = {
      nombre: "iPhone 13 Pro",
      capacidad,
      condicion,
      precio: 849
    };
    setCarrito([...carrito, producto]);
  };

  const capacidades = [
    { gb: "128GB", extra: "+$0" },
    { gb: "256GB", extra: "+$50" },
    { gb: "512GB", extra: "+$100" }
  ];

  return (
    <div className="page-wrapper">


      {/* DETALLE DEL PRODUCTO (HERO) */}
      <section className="product-detail-hero">
        {/* Columna Izquierda: Imágenes */}
        <div className="pd-gallery">
          <div className="pd-main-image">
            <img src="https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-13-pro-family-hero" alt="iPhone 13 Pro" />
          </div>
          <div className="pd-thumbnails">
            <div className="thumb active"><img src="https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-13-pro-family-hero" alt="thumb1" /></div>
            <div className="thumb"><img src="https://m.media-amazon.com/images/I/61jLiCovxVL._AC_SY741_.jpg" alt="thumb2" /></div>
            <div className="thumb"><img src="https://m.media-amazon.com/images/I/617yZ8NlV6L._AC_SY741_.jpg" alt="thumb3" /></div>
          </div>
        </div>

        {/* Columna Derecha: Información y Compra */}
        <div className="pd-info">
          <span className="badge badge-reacondicionado">REACONDICIONADO CERTIFICADO</span>
          <h1 className="pd-title">iPhone 13 Pro</h1>

          <div className="pd-pricing">
            <span className="pd-price">$849.00</span>
            <span className="pd-old-price">$999.00</span>
          </div>

          {/* Selector de Condición */}
          <div className="pd-option-group">
            <div className="pd-option-header">
              <span className="pd-label">CONDICIÓN</span>
              <a href="#" className="pd-link">Guía de condiciones</a>
            </div>
            <div className="pd-btn-grid-3">
              {["Como nuevo", "Excelente", "Usado"].map(cond => (
                <button
                  key={cond}
                  className={`opt-btn ${condicion === cond ? "active" : ""}`}
                  onClick={() => setCondicion(cond)}
                >
                  {cond}
                </button>
              ))}
            </div>
          </div>

          {/* Selector de Capacidad */}
          <div className="pd-option-group">
            <span className="pd-label">CAPACIDAD</span>
            <div className="pd-btn-grid-3">
              {capacidades.map(cap => (
                <button
                  key={cap.gb}
                  className={`opt-btn ${capacidad === cap.gb ? "active" : ""}`}
                  onClick={() => setCapacidad(cap.gb)}
                >
                  <strong>{cap.gb}</strong>
                  <span className="opt-subtext">{cap.extra}</span>
                </button>
              ))}
            </div>
          </div>

          <button className="btn-dark btn-buy" onClick={agregarAlCarrito}>
            Añadir al carrito
          </button>
          <p className="pd-shipping-info">Envío gratuito y devoluciones en 30 días.</p>
        </div>
      </section>

      {/* BENEFICIOS (Trust Bar) */}
      <section className="pd-benefits">
        <div className="benefit-item">
          <span className="benefit-icon">🛡️</span>
          <h4>Garantía de 12 meses</h4>
          <p>Cobertura total para cualquier defecto de hardware.</p>
        </div>
        <div className="benefit-item">
          <span className="benefit-icon">🔋</span>
          <h4>+90% de salud de batería</h4>
          <p>Baterías originales de Apple, máximo rendimiento.</p>
        </div>
        <div className="benefit-item">
          <span className="benefit-icon">⚙️</span>
          <h4>Inspección de 40 puntos</h4>
          <p>Cada dispositivo se somete a pruebas rigurosas.</p>
        </div>
        <div className="benefit-item">
          <span className="benefit-icon">🔒</span>
          <h4>Pago seguro</h4>
          <p>Pago 100% cifrado y protegido.</p>
        </div>
      </section>

      {/* DESTREZA TÉCNICA E INDICADOR */}
      <section className="pd-specs-container">
        <div className="pd-tech-box">
          <div className="tech-info">
            <h2>Destreza técnica</h2>
            <p><strong>Display:</strong> Super Retina XDR de 6.1" con ProMotion</p>
            <p><strong>Cámara:</strong> Pro 12MP system: Telephoto, Wide, Ultra Wide</p>
            <p><strong>Chip:</strong> Chip Bionic A15 con CPU de 6 núcleos</p>
          </div>
          <div className="tech-img">
            {/* Imagen ilustrativa de un procesador/chip */}
            <img src="https://m.media-amazon.com/images/I/51C7hGvpgEL._AC_SX466_.jpg" alt="Chip A15" />
          </div>
        </div>

        <div className="pd-indicator-box">
          <h3>Indicador de estado</h3>
          <p>Este dispositivo tiene una valoración de 9.8/10 en el proceso de inspección de Air Mobile.</p>
          <div className="indicator-card">
            <h4>COMO NUEVO (PREMIUM)</h4>
            <p>No se aprecian arañazos a 20 cm de distancia. Totalmente impecable. Procesado de estética y hardware impecable.</p>
          </div>
        </div>
      </section>

      {/* PRODUCTOS RELACIONADOS (Accesorios) */}
      <section className="products-section">
        <div className="products-header">
          <h2>Combinaciones perfectas</h2>
          <a href="#">Descubrir los accesorios</a>
        </div>

        <div className="products-grid">
          {[
            { name: "MagSafe Clear Case", price: "$49.00", img: "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/MHXH3" },
            { name: "20W USB-C Adaptador", price: "$19.00", img: "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/MU7V2" },
            { name: "AirPods Pro (2nd Gen)", price: "$249.00", img: "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/MQD83" },
            { name: "Privacy Glass Shield", price: "$29.00", img: "https://acdn-us.mitiendanube.com/stores/003/480/832/products/img_83991-bd583b1599b616e08e16920418477310-1024-1024.webp" },
          ].map((p, i) => (
            <div key={i} className="product-card">
              <div className="product-img">
                <img src={p.img} alt={p.name} />
              </div>
              <p className="product-name">{p.name}</p>
              <p className="product-price">{p.price}</p>
              {/* Botón secundario blanco para los accesorios */}
              <button className="btn-secondary" style={{ width: "100%", marginTop: "12px" }}>
                Añadir al carrito
              </button>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}