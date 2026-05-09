
import '../style/home.css';


export default function Footer(){
    return(
              <footer>
        <div className="footer-content">
          <div className="footer-logo">
            <h3>AirMobile</h3>
            <p>© 2024 Todo los derechos reservados</p>
          </div>
          <div className="footer-links">
            <a href="#">Política de privacidad</a>
            <a href="#">Condiciones de servicio</a>
            <a href="#">Información de envío</a>
            <a href="#">Devoluciones</a>
          </div>
        </div>
      </footer>
    )
}