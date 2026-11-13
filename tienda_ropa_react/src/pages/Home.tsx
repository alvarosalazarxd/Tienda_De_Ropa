import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import useProductos from '../hooks/useProductos';
import {
  formatearPrecioCLP,
  obtenerImagenProducto,
  obtenerNombreCategoria
} from '../services/producto.service';

const banners = [
  { src: '/img/banner1.jfif', alt: 'Moda & Estilo' },
  { src: '/img/banner2.jfif', alt: 'Colección de moda' },
  { src: '/img/banner3.jfif', alt: 'Nueva colección' }
];

const Home = () => {
  const [slideActual, setSlideActual] = useState(0);
  // Hook personalizado para traer los productos destacados desde Spring Boot
  const { productos, loading, error } = useProductos();

  useEffect(() => {
    const intervalo = window.setInterval(() => {
      setSlideActual((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => window.clearInterval(intervalo);
  }, []);

  const destacados = productos.slice(0, 8);

  return (
    <div>
      <header className="hero-carousel">
        <div className="carousel slide h-100">
          <div className="carousel-indicators">
            {banners.map((_, idx) => (
              <button
                key={idx}
                type="button"
                className={idx === slideActual ? 'active' : ''}
                aria-label={`Imagen ${idx + 1}`}
                onClick={() => setSlideActual(idx)}
              />
            ))}
          </div>

          <div className="carousel-inner h-100">
            {banners.map((banner, idx) => (
              <div
                key={banner.src}
                className={`carousel-item h-100 ${
                  idx === slideActual ? 'active' : ''
                }`}
              >
                <img
                  src={banner.src}
                  className="d-block w-100"
                  alt={banner.alt}
                />
              </div>
            ))}
          </div>

          <div className="carousel-overlay"></div>

          <div className="carousel-caption-custom">
            <div className="container text-center">
              <h1 className="display-5 fw-bold text-uppercase mb-3">
                Bienvenido a Moda &amp; Estilo
              </h1>
              <p
                className="lead text-white mx-auto mb-4"
                style={{ maxWidth: '700px' }}
              >
                Descubre las últimas tendencias en ropa urbana, casual, formal y
                accesorios de alta calidad.
              </p>
              <Link
                to="/productos"
                className="btn btn-fashion btn-lg rounded-pill px-5 fw-bold"
              >
                Explorar Catálogo
              </Link>
            </div>
          </div>

          <button
            className="carousel-control-prev"
            type="button"
            onClick={() =>
              setSlideActual(
                (prev) => (prev - 1 + banners.length) % banners.length
              )
            }
          >
            <span
              className="carousel-control-prev-icon"
              aria-hidden="true"
            ></span>
            <span className="visually-hidden">Anterior</span>
          </button>

          <button
            className="carousel-control-next"
            type="button"
            onClick={() =>
              setSlideActual((prev) => (prev + 1) % banners.length)
            }
          >
            <span
              className="carousel-control-next-icon"
              aria-hidden="true"
            ></span>
            <span className="visually-hidden">Siguiente</span>
          </button>
        </div>
      </header>

      <main className="container my-5">
        <h2
          className="text-center fw-bold mb-5 text-uppercase"
          style={{ letterSpacing: '1px' }}
        >
          ¿Por qué elegirnos?
        </h2>

        <div className="row text-center g-4 mb-5">
          <div className="col-md-4">
            <div className="card card-custom h-100 shadow-sm p-3">
              <div className="card-body">
                <i className="bi bi-truck text-gold fs-1 mb-3 d-block"></i>
                <h4 className="card-title fw-bold mb-2">Envíos a todo Chile</h4>
                <p className="card-text text-muted small">
                  Recibe tus productos de forma rápida y segura directamente en
                  la puerta de tu casa.
                </p>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card card-custom h-100 shadow-sm p-3">
              <div className="card-body">
                <i className="bi bi-shield-check text-gold fs-1 mb-3 d-block"></i>
                <h4 className="card-title fw-bold mb-2">Compra Segura</h4>
                <p className="card-text text-muted small">
                  Protegemos tu información personal y garantizamos
                  transacciones con total confianza.
                </p>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card card-custom h-100 shadow-sm p-3">
              <div className="card-body">
                <i className="bi bi-tags-fill text-gold fs-1 mb-3 d-block"></i>
                <h4 className="card-title fw-bold mb-2">Calidad Garantizada</h4>
                <p className="card-text text-muted small">
                  Prendas diseñadas con los mejores materiales del mercado para
                  ofrecer la mayor comodidad.
                </p>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-5">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="fw-bold text-uppercase mb-0">
              Prendas Destacadas
            </h3>
            <Link
              to="/productos"
              className="btn btn-outline-dark btn-sm rounded-pill px-3"
            >
              Ver todo el catálogo
            </Link>
          </div>

          {loading && <p className="text-muted">Cargando productos...</p>}
          {error && (
            <div className="alert alert-warning">
              No se pudo conectar al servicio de productos a través del Gateway (puerto 8080).
              Verifica que el Gateway y los microservicios estén encendidos junto con MySQL en XAMPP.
            </div>
          )}

          <div className="row g-4">
            {destacados.map((producto) => (
              <div key={producto.id} className="col-12 col-sm-6 col-lg-3">
                <div className="card producto-card shadow-sm h-100">
                  <div className="producto-imagen-container">
                    <Link to={`/productos/${producto.id}`}>
                      <img
                        src={obtenerImagenProducto(producto)}
                        alt={producto.nombre}
                      />
                    </Link>
                  </div>
                  <div className="card-body d-flex flex-column">
                    <span className="badge bg-light text-dark border align-self-start mb-2">
                      {obtenerNombreCategoria(producto.categoria)}
                    </span>
                    <h5 className="fw-bold fs-6">{producto.nombre}</h5>
                    <p className="text-muted small flex-grow-1">
                      {producto.descripcion}
                    </p>
                    <div className="d-flex justify-content-between align-items-center mt-2">
                      <span className="precio-producto">
                        {formatearPrecioCLP(producto.precio)}
                      </span>
                      <Link
                        to={`/productos/${producto.id}`}
                        className="btn btn-sm btn-fashion rounded-pill px-3"
                      >
                        Ver detalle
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
