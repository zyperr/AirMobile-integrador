import '../../style/home.css';

export default function Footer() {
  return (
    
    <footer className="bg-light py-4 border-top">
      {/* bg-light le da el fondo gris claro, py-4 el padding vertical y border-top la línea superior */}
      <div className="container-fluid px-4 px-md-5">
        
        {/* En móviles es columna (apilado), en PC es fila (flex-row) y separado (justify-content-between) */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          
          {/* Logo y Copyright */}
          <div className="text-center text-md-start">
            <h3 className="fs-6 fw-bold mb-1 text-dark">AirMobile</h3>
            <p className="text-secondary mb-0" style={{ fontSize: "12px" }}>
              © 2026 Todos los derechos reservados
            </p>
          </div>

          {/* Links */}
          <div className="d-flex flex-wrap justify-content-center gap-3 gap-md-4">
            <a href="#" className="text-secondary text-decoration-none custom-footer-link">Política de privacidad</a>
            <a href="#" className="text-secondary text-decoration-none custom-footer-link">Condiciones de servicio</a>
            <a href="#" className="text-secondary text-decoration-none custom-footer-link">Información de envío</a>
            <a href="#" className="text-secondary text-decoration-none custom-footer-link">Devoluciones</a>
          </div>

        </div>
      </div>
    </footer>
  );
}