import { Link } from "react-router-dom";
import "../style/home.css";
import { useApi } from "../hooks/useApi.js"
import { useEffect, useState } from "react";
import CartaProducto from "../components/CartaDeProductos";
import { SkeletonLoader } from "../components/SkeletonLoader.jsx";

export default function Home() {


  const endpoint = "productos/productos?page=1&orden=asc&limit=4";



  const [productos, setProductos] = useState([]);

  const { ejecutarPeticion, isLoading, err } = useApi();


  useEffect(() => {
    const getProductos = async () => {
      const resultado = await ejecutarPeticion(endpoint);
      if (resultado.exito) {
        setProductos(resultado.data);
      }
    }
    getProductos();
  }, []);


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
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  style={{ minWidth: "200px" }}
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
          <h2 className="fw-bold fs-3 m-0">Más recientes</h2>
        </div>
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">

          {(isLoading || productos == null) ? (

            SkeletonLoader({ cantidad: 4 })

          ) : (
            productos?.data?.map((producto) => (

              <div className="col" key={producto.id}>
                <CartaProducto
                  nombreDeProducto={producto.nombre_producto}
                  condicion={producto.condicion}
                  precio={producto.precio}
                  capacidad={producto.capacidad}
                  imagen_url={producto.imagen_url}
                />
              </div>
            ))
          )
          }
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
            <Link to="/catalogo" className="btn btn-primary px-5 py-3 fw-semibold rounded-3 w-100 w-md-auto" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              Ver Productos
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}