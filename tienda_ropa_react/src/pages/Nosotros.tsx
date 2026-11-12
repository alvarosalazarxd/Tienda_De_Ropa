import { Link } from 'react-router';

const Nosotros = () => {
  return (
    <div>
      <header className="nosotros-hero">
        <div className="nosotros-hero-content">
          <div className="hero-line"></div>
          <h1 className="fw-bold text-uppercase">Nuestra Historia</h1>
          <p>Más que moda, una forma de expresar quién eres.</p>
          <a
            href="#quienes-somos"
            className="btn btn-gold rounded-pill px-4 py-2"
          >
            Conócenos <i className="bi bi-arrow-down ms-2"></i>
          </a>
        </div>
      </header>

      <main>
        <section id="quienes-somos" className="quienes-somos">
          <div className="container">
            <div className="row align-items-center g-5">
              <div className="col-12 col-lg-6">
                <img
                  src="/img/casual.jpg"
                  alt="Moda & Estilo"
                  className="quienes-somos-imagen"
                />
              </div>

              <div className="col-12 col-lg-6">
                <span className="text-gold fw-semibold text-uppercase">
                  Moda &amp; Estilo
                </span>
                <h2 className="fw-bold text-uppercase mt-2">Quiénes Somos</h2>
                <div className="linea-dorada"></div>
                <p className="text-secondary">
                  En Moda &amp; Estilo creemos que la ropa es una forma de
                  expresión. Por eso seleccionamos prendas y accesorios que
                  combinan las tendencias actuales con diseños versátiles para
                  acompañarte en cada ocasión.
                </p>
                <p className="text-secondary">
                  Nuestra propuesta busca entregar una experiencia de compra
                  simple, moderna y segura, ofreciendo alternativas para
                  distintos estilos y personalidades.
                </p>
                <Link
                  to="/productos"
                  className="btn btn-fashion rounded-pill px-4 mt-2"
                >
                  Explorar productos <i className="bi bi-arrow-right ms-2"></i>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-4 pb-5">
          <div className="container">
            <div className="text-center mb-5">
              <span className="text-gold fw-semibold text-uppercase">
                Descubre tu estilo
              </span>
              <h2 className="fw-bold text-uppercase mt-2">
                Nuestras Colecciones
              </h2>
              <p className="text-muted mt-2">
                Encuentra prendas y accesorios pensados para acompañarte en cada
                momento.
              </p>
            </div>

            <div className="row g-4">
              <div className="col-12 col-sm-6 col-lg-3">
                <div className="coleccion-card shadow-sm">
                  <img src="/img/urbana.jpg" alt="Estilo Urbano" />
                  <div className="card-body d-flex flex-column p-4">
                    <h5 className="fw-bold">
                      <i className="bi bi-buildings coleccion-icon"></i>
                      Estilo Urbano
                    </h5>
                    <p className="text-muted small mb-4">
                      Diseños modernos inspirados en la moda de calle,
                      combinando comodidad y personalidad para tu día a día.
                    </p>
                    <Link
                      to="/productos?categoria=URBANO"
                      className="btn btn-fashion mt-auto rounded-pill"
                    >
                      Explorar <i className="bi bi-arrow-right ms-2"></i>
                    </Link>
                  </div>
                </div>
              </div>

              <div className="col-12 col-sm-6 col-lg-3">
                <div className="coleccion-card shadow-sm">
                  <img src="/img/casual.jpg" alt="Colección Casual" />
                  <div className="card-body d-flex flex-column p-4">
                    <h5 className="fw-bold">
                      <i className="bi bi-sun coleccion-icon"></i>
                      Colección Casual
                    </h5>
                    <p className="text-muted small mb-4">
                      Prendas esenciales y versátiles que combinan comodidad,
                      estilo y calidad para cualquier ocasión.
                    </p>
                    <Link
                      to="/productos?categoria=CASUAL"
                      className="btn btn-fashion mt-auto rounded-pill"
                    >
                      Explorar <i className="bi bi-arrow-right ms-2"></i>
                    </Link>
                  </div>
                </div>
              </div>

              <div className="col-12 col-sm-6 col-lg-3">
                <div className="coleccion-card shadow-sm">
                  <img src="/img/formal.jpg" alt="Línea Formal" />
                  <div className="card-body d-flex flex-column p-4">
                    <h5 className="fw-bold">
                      <i className="bi bi-stars coleccion-icon"></i>
                      Línea Formal
                    </h5>
                    <p className="text-muted small mb-4">
                      Cortes sofisticados y acabados de primera calidad para
                      ocasiones especiales y momentos importantes.
                    </p>
                    <Link
                      to="/productos?categoria=FORMAL"
                      className="btn btn-fashion mt-auto rounded-pill"
                    >
                      Explorar <i className="bi bi-arrow-right ms-2"></i>
                    </Link>
                  </div>
                </div>
              </div>

              <div className="col-12 col-sm-6 col-lg-3">
                <div className="coleccion-card shadow-sm">
                  <img src="/img/accesorios.jpg" alt="Accesorios" />
                  <div className="card-body d-flex flex-column p-4">
                    <h5 className="fw-bold">
                      <i className="bi bi-gem coleccion-icon"></i>
                      Accesorios
                    </h5>
                    <p className="text-muted small mb-4">
                      El detalle final que complementa tu look y transforma
                      cualquier atuendo.
                    </p>
                    <Link
                      to="/productos?categoria=ACCESORIOS"
                      className="btn btn-fashion mt-auto rounded-pill"
                    >
                      Ver accesorios <i className="bi bi-arrow-right ms-2"></i>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="valores-section">
          <div className="container">
            <div className="text-center mb-5">
              <span className="text-gold fw-semibold text-uppercase">
                Nuestra esencia
              </span>
              <h2 className="fw-bold text-uppercase text-white mt-2">
                Lo que nos representa
              </h2>
              <p className="text-white-50 mt-2">
                Tres pilares que forman parte de nuestra manera de entender la
                moda.
              </p>
            </div>

            <div className="row g-4">
              <div className="col-12 col-md-4">
                <div className="valor-card">
                  <div className="valor-icon">
                    <i className="bi bi-award"></i>
                  </div>
                  <h4 className="text-white">Calidad</h4>
                  <p className="text-white-50 small mb-0">
                    Seleccionamos nuestros productos buscando entregar una
                    experiencia que combine diseño, comodidad y durabilidad.
                  </p>
                </div>
              </div>

              <div className="col-12 col-md-4">
                <div className="valor-card">
                  <div className="valor-icon">
                    <i className="bi bi-stars"></i>
                  </div>
                  <h4 className="text-white">Estilo</h4>
                  <p className="text-white-50 small mb-0">
                    Seguimos las tendencias actuales sin dejar de lado la
                    personalidad y autenticidad de cada persona.
                  </p>
                </div>
              </div>

              <div className="col-12 col-md-4">
                <div className="valor-card">
                  <div className="valor-icon">
                    <i className="bi bi-shield-check"></i>
                  </div>
                  <h4 className="text-white">Confianza</h4>
                  <p className="text-white-50 small mb-0">
                    Buscamos ofrecer una experiencia de compra sencilla, segura
                    y transparente para nuestros clientes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container mb-5 pb-3">
          <div className="text-center mb-5">
            <span className="text-gold fw-semibold text-uppercase">
              Nuestro propósito
            </span>
            <h2 className="fw-bold text-uppercase mt-2">Misión y Visión</h2>
          </div>

          <div className="row g-4">
            <div className="col-md-6">
              <div className="mision-card">
                <h4 className="fw-bold">
                  <i className="bi bi-bullseye text-gold me-2"></i>
                  Nuestra Misión
                </h4>
                <p className="text-muted mb-0">
                  Ofrecer prendas de vestir que combinen tendencia, confort y
                  calidad, permitiendo a cada persona expresar su identidad
                  única a través de la moda.
                </p>
              </div>
            </div>

            <div className="col-md-6">
              <div className="mision-card">
                <h4 className="fw-bold">
                  <i className="bi bi-eye text-gold me-2"></i>
                  Nuestra Visión
                </h4>
                <p className="text-muted mb-0">
                  Convertirnos en la marca líder de moda urbana e indumentaria
                  en la región, reconocida por nuestra calidad y atención al
                  cliente.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Nosotros;
