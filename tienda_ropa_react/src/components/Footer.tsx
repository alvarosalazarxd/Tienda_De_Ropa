import { Link } from 'react-router';

const Footer = () => {
  return (
    <footer className="footer-custom pt-5 pb-3 mt-auto">
      <div className="container">
        <div className="row g-4 align-items-start mb-4">
          <div className="col-12 col-lg-4">
            <span className="font-editorial fs-3 fw-bold text-white text-uppercase d-block mb-2">
              Moda <span className="text-gold">&amp;</span> Estilo
            </span>
            <p className="small text-white-50 mb-3" style={{ maxWidth: '320px' }}>
              Curaduría contemporánea de prendas urbanas, casuales, deportivas,
              formales y accesorios diseñados para destacar cada día.
            </p>
            <div className="d-flex gap-2 text-white-50 small">
              <i className="bi bi-shield-check text-gold"></i>
              <span>Compra 100% Segura y Garantizada</span>
            </div>
          </div>

          <div className="col-6 col-md-4 col-lg-2">
            <h6 className="fw-bold text-uppercase mb-3">TIENDA</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2 mb-0">
              <li>
                <Link
                  to="/"
                  className="text-white-50 text-decoration-none hover-link"
                >
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  to="/productos"
                  className="text-white-50 text-decoration-none hover-link"
                >
                  Catálogo
                </Link>
              </li>
              <li>
                <Link
                  to="/nosotros"
                  className="text-white-50 text-decoration-none hover-link"
                >
                  Nosotros
                </Link>
              </li>
              <li>
                <Link
                  to="/mis-compras"
                  className="text-white-50 text-decoration-none hover-link"
                >
                  Mis Compras
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-6 col-md-4 col-lg-3">
            <h6 className="fw-bold text-uppercase mb-3">CONTACTO</h6>
            <p className="small text-white-50 mb-2">
              <i className="bi bi-geo-alt-fill text-gold me-2"></i>
              Concepción, Chile
            </p>
            <p className="small mb-2">
              <a
                href="https://wa.me/56912345678"
                target="_blank"
                rel="noreferrer"
                className="text-white-50 text-decoration-none hover-link"
              >
                <i className="bi bi-whatsapp text-gold me-2"></i>
                +56 9 1234 5678
              </a>
            </p>
            <p className="small mb-2">
              <a
                href="mailto:contacto@modaestilo.cl"
                className="text-white-50 text-decoration-none hover-link"
              >
                <i className="bi bi-envelope-fill text-gold me-2"></i>
                contacto@modaestilo.cl
              </a>
            </p>
            <p className="small text-white-50 mb-0">
              <i className="bi bi-clock-fill text-gold me-2"></i>
              Lun - Sáb: 10:00 - 20:00 hrs
            </p>
          </div>

          <div className="col-12 col-md-4 col-lg-3">
            <h6 className="fw-bold text-uppercase mb-3">COMUNIDAD</h6>
            <div className="d-flex flex-wrap gap-2 mb-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="social-pill"
                aria-label="Instagram"
              >
                <i className="bi bi-instagram"></i>
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noreferrer"
                className="social-pill"
                aria-label="TikTok"
              >
                <i className="bi bi-tiktok"></i>
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="social-pill"
                aria-label="Facebook"
              >
                <i className="bi bi-facebook"></i>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="social-pill"
                aria-label="YouTube"
              >
                <i className="bi bi-youtube"></i>
              </a>
            </div>
            <p className="small text-white-50 mb-0">
              Síguenos para enterarte primero de nuevos lanzamientos y ediciones
              limitadas.
            </p>
          </div>
        </div>

        <hr className="border-secondary border-opacity-25 my-3" />

        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 text-white-50 small">
          <p className="mb-0">
            &copy; 2026 Moda &amp; Estilo. Todos los derechos reservados.
          </p>
          <div className="d-flex gap-3 text-gold">
            <i
              className="bi bi-credit-card-2-front fs-5"
              title="Tarjetas de Crédito / Débito"
            ></i>
            <i
              className="bi bi-cash-coin fs-5"
              title="Transferencia Directa"
            ></i>
            <i className="bi bi-truck fs-5" title="Envíos a todo Chile"></i>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
