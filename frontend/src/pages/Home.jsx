import { Link } from "react-router-dom";
import "../style/home.css";

export default function Home() {
  return (
    <div>
      {/* HERO */}
      <section className="bg-light py-5">
        <div className="container">
          <div className="row align-items-center text-center text-md-start gap-4 gap-md-0">
            <div className="col-md-6">
              <h1 className="display-4 fw-bold text-dark mb-3" style={{ letterSpacing: "-0.02em" }}>
                Tu próximo<br />iPhone,<br />al mejor precio.
              </h1>
              <p className="lead text-secondary mb-4">
                Equipos nuevos y reacondicionados con garantía de 12 meses.
              </p>

              <div className="d-flex flex-column flex-sm-row justify-content-center justify-content-md-start gap-3 mt-4">
                {/* El Link ahora ES el botón */}
                <Link
                  to="/catalogo"
                  className="btn btn-primary px-4 py-3 fw-semibold rounded-3 d-flex align-items-center justify-content-center"
                  style={{ minWidth: "180px" }}
                >
                  Ver Catálogo
                </Link>
              </div>
            </div>

            <div className="col-md-6 text-center">
              <img
                src="/img/iPhone 13 Pro Sierra Blue.jpg"
                alt="iPhone"
                className="img-fluid rounded-4 shadow-sm hero-img-max"
              />
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <div className="container py-5">
        <div className="row text-center gy-4">
          <div className="col-6 col-md-3 d-flex flex-column flex-md-row align-items-center justify-content-center gap-2 fw-bold text-primary text-uppercase" style={{ fontSize: "11px", letterSpacing: "0.5px" }}>
            <i className="bi bi-truck fs-5"></i> ENVIO GRATIS
          </div>
          <div className="col-6 col-md-3 d-flex flex-column flex-md-row align-items-center justify-content-center gap-2 fw-bold text-primary text-uppercase" style={{ fontSize: "11px", letterSpacing: "0.5px" }}>
            <i className="bi bi-shield-check fs-5"></i> GARANTIA
          </div>
          <div className="col-6 col-md-3 d-flex flex-column flex-md-row align-items-center justify-content-center gap-2 fw-bold text-primary text-uppercase" style={{ fontSize: "11px", letterSpacing: "0.5px" }}>
            <i className="bi bi-tools fs-5"></i> EQUIPO PROBADO
          </div>
          <div className="col-6 col-md-3 d-flex flex-column flex-md-row align-items-center justify-content-center gap-2 fw-bold text-primary text-uppercase" style={{ fontSize: "11px", letterSpacing: "0.5px" }}>
            <i className="bi bi-shield-lock fs-5"></i> PAGO SEGURO
          </div>
        </div>
      </div>

      {/* PRODUCTOS */}
      <section className="container py-5">
        <div className="d-flex justify-content-between align-items-end mb-4">
          <h2 className="fw-bold fs-3 m-0">Los más buscados</h2>
        </div>

        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-4 g-4">

          <div className="col">
            <Link to="/product" className="text-decoration-none text-dark">
              <div className="card h-100 border-0 rounded-4 p-3 custom-card-hover">
                <div className="bg-light rounded-3 p-3 mb-3 d-flex align-items-center justify-content-center product-img-box">
                  <img src="/img/iPhone 13 Pro.jpg" alt="iPhone 13" className="img-fluid" style={{ maxHeight: "100%" }} />
                </div>
                <div className="text-start">
                  <span className="badge rounded-pill badge-reacondicionado mb-2">Reacondicionado</span>
                  <div className="fw-semibold fs-6 mb-1">iPhone 13 Pro</div>
                  <div className="text-secondary fs-5">$849.00</div>
                </div>
              </div>
            </Link>
          </div>

          <div className="col">
            <div className="card h-100 border-0 rounded-4 p-3 custom-card-hover">
              <div className="bg-light rounded-3 p-3 mb-3 d-flex align-items-center justify-content-center product-img-box">
                <img src="/img/iPhone 15 Case.jpg" alt="Case" className="img-fluid" style={{ maxHeight: "100%" }} />
              </div>
              <div className="text-start">
                <span className="badge rounded-pill badge-accesorio mb-2">Accesorio</span>
                <div className="fw-semibold fs-6 mb-1">Silicone Case</div>
                <div className="text-secondary fs-5">$49.00</div>
              </div>
            </div>
          </div>

          <div className="col">
            <div className="card h-100 border-0 rounded-4 p-3 custom-card-hover">
              <div className="bg-light rounded-3 p-3 mb-3 d-flex align-items-center justify-content-center product-img-box">
                <img src="/img/Cargador-Iphone.png" alt="Cargador" className="img-fluid" style={{ maxHeight: "100%" }} />
              </div>
              <div className="text-start">
                <span className="badge rounded-pill badge-energia mb-2">Energía</span>
                <div className="fw-semibold fs-6 mb-1">Cargador</div>
                <div className="text-secondary fs-5">$19.00</div>
              </div>
            </div>
          </div>

          <div className="col">
            <div className="card h-100 border-0 rounded-4 p-3 custom-card-hover">
              <div className="bg-light rounded-3 p-3 mb-3 d-flex align-items-center justify-content-center product-img-box">
                <img src="/img/iPhone 12 Pro.png" alt="iPhone 12" className="img-fluid" style={{ maxHeight: "100%" }} />
              </div>
              <div className="text-start">
                <span className="badge rounded-pill badge-reacondicionado mb-2">Reacondicionado</span>
                <div className="fw-semibold fs-6 mb-1">iPhone 12</div>
                <div className="text-secondary fs-5">$549.00</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* GARANTIA */}
      <section className="container mb-5">
        <div className="row align-items-center bg-light rounded-5 p-4 p-md-5">
          <div className="col-md-5 mb-4 mb-md-0 text-center">
            <img
              src="/img/Img-Garantia.jpg"
              alt="Garantía"
              className="img-fluid rounded-4 shadow"
            />
          </div>
          <div className="col-md-7 text-center text-md-start px-md-5">
            <h2 className="fw-bold mb-3 display-6 text-dark">Garantía de Excelencia</h2>
            <p className="text-secondary mb-4 fs-5">
              Cada dispositivo es inspeccionado en 40 puntos para asegurar tu tranquilidad.
            </p>
            <button className="btn btn-primary px-5 py-3 fw-semibold rounded-3 w-100 w-md-auto">Ver Productos</button>
          </div>
        </div>
      </section>

    </div>
  );
}