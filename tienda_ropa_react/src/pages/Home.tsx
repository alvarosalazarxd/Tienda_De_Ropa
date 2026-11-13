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

const categoriasShowcase = [
  {
    slug: 'URBANO',
    titulo: 'Estilo Urbano',
    subtitulo: 'Streetwear y cortes oversize',
    img: '/img/urbana.jpg'
  },
  {
    slug: 'CASUAL',
    titulo: 'Colección Casual',
    subtitulo: 'Esenciales versátiles de diario',
    img: '/img/casual.jpg'
  },
  {
    slug: 'FORMAL',
    titulo: 'Línea Formal',
    subtitulo: 'Sastrería elegante y sobria',
    img: '/img/formal.jpg'
  },
  {
    slug: 'DEPORTIVO',
    titulo: 'Línea Deportiva',
    subtitulo: 'Rendimiento y comodidad activa',
    img: '/img/deportiva.jpg'
  },
  {
    slug: 'ACCESORIOS',
    titulo: 'Accesorios',
    subtitulo: 'Detalles que completan tu look',
    img: '/img/accesorios.jpg'
  }
];

const beneficios = [
  {
    icono: 'bi-truck',
    titulo: 'Envíos a todo Chile',
    desc: 'Despacho rápido y seguimiento en tiempo real directamente a tu domicilio.'
  },
  {
    icono: 'bi-shield-check',
    titulo: 'Compra Protegida',
    desc: 'Respaldamos tus datos y garantizamos transacciones seguras en cada paso.'
  },
  {
    icono: 'bi-gem',
    titulo: 'Calidad Boutique',
    desc: 'Prendas confeccionadas con materiales seleccionados para máxima durabilidad.'
  }
];

const Home = () => {
  const [slideActual, setSlideActual] = useState(0);
  // Hook personalizado para traer los productos destacados desde Spring Boot
  const { productos, loading, error } = useProductos();

  useEffect(() => {
    const intervalo = window.setInterval(() => {
      setSlideActual((prev) => (prev + 1) % banners.length);
    }, 4500);
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
              <span className="hero-eyebrow">Nueva Colección 2026</span>
              <h1 className="hero-title text-uppercase mb-3">
                Moda <span className="text-gold">&amp;</span> Estilo
              </h1>
              <p
                className="lead text-white-50 mx-auto mb-4"
                style={{ maxWidth: '640px' }}
              >
                Siluetas urbanas, cortes formales, prendas deportivas y
                accesorios pensados para elevar tu estilo todos los días.
              </p>
              <div className="d-flex flex-wrap justify-content-center gap-3">
                <Link
                  to="/productos"
                  className="btn btn-gold btn-lg rounded-pill px-4 px-md-5 fw-bold"
                >
                  Explorar Catálogo
                  <i className="bi bi-arrow-right ms-2"></i>
                </Link>
                <Link
                  to="/nosotros"
                  className="btn btn-outline-light btn-lg rounded-pill px-4"
                >
                  Nuestra Historia
                </Link>
              </div>
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

      <main className="container my-5 py-2">
        <section className="mb-5">
          <div className="text-center mb-4">
            <span className="section-eyebrow">Experiencia Boutique</span>
            <h2 className="section-heading mb-0">¿Por qué elegirnos?</h2>
          </div>

          <div className="row text-center g-4">
            {beneficios.map((item) => (
              <div key={item.titulo} className="col-md-4">
                <div className="feature-boutique">
                  <div className="feature-icon-circle">
                    <i className={`bi ${item.icono}`}></i>
                  </div>
                  <h4 className="fw-bold fs-5 mb-2">{item.titulo}</h4>
                  <p className="text-muted small mb-0">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="my-5 pt-2">
          <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
            <div>
              <span className="section-eyebrow">Curaduría de Moda</span>
              <h2 className="section-heading mb-0">Explora por Colección</h2>
            </div>
            <Link
              to="/productos"
              className="btn btn-outline-dark btn-sm rounded-pill px-3 fw-semibold"
            >
              Ver todas las líneas
            </Link>
          </div>

          <div className="row g-3 row-cols-1 row-cols-sm-2 row-cols-lg-5">
            {categoriasShowcase.map((cat) => (
              <div key={cat.slug} className="col">
                <Link
                  to={`/productos?categoria=${cat.slug}`}
                  className="categoria-tile"
                >
                  <img src={cat.img} alt={cat.titulo} />
                  <div className="categoria-tile-overlay">
                    <span className="text-gold small fw-semibold text-uppercase">
                      Colección
                    </span>
                    <h5 className="text-white fw-bold mb-1 fs-6">
                      {cat.titulo}
                    </h5>
                    <div className="d-flex justify-content-between align-items-center text-white-50 small">
                      <span>{cat.subtitulo}</span>
                      <i className="bi bi-arrow-right text-gold categoria-tile-arrow"></i>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section className="my-5 pt-2">
          <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
            <div>
              <span className="section-eyebrow">Selección de Temporada</span>
              <h2 className="section-heading mb-0">Prendas Destacadas</h2>
            </div>
            <Link
              to="/productos"
              className="btn btn-fashion btn-sm rounded-pill px-4 py-2"
            >
              Ver todo el catálogo
              <i className="bi bi-arrow-right ms-2"></i>
            </Link>
          </div>

          {loading && <p className="text-muted">Cargando productos...</p>}
          {error && (
            <div className="alert alert-warning">
              No se pudo conectar al servicio de productos a través del Gateway
              (puerto 8080). Verifica que el Gateway y los microservicios estén
              encendidos junto con MySQL en XAMPP.
            </div>
          )}

          <div className="row g-4">
            {destacados.map((producto) => {
              const agotado = producto.stock <= 0;
              const bajoStock = producto.stock > 0 && producto.stock <= 5;
              return (
                <div
                  key={producto.id}
                  className="col-12 col-sm-6 col-lg-3 d-flex"
                >
                  <div className="card producto-card shadow-sm w-100">
                    <div className="producto-imagen-container">
                      {agotado && (
                        <span className="badge bg-danger position-absolute top-0 start-0 m-3 z-1 px-2 py-1 rounded-pill">
                          Agotado
                        </span>
                      )}
                      {bajoStock && (
                        <span className="badge bg-dark text-gold border border-gold position-absolute top-0 start-0 m-3 z-1 px-2 py-1 rounded-pill">
                          Últimas {producto.stock} u.
                        </span>
                      )}
                      <Link to={`/productos/${producto.id}`}>
                        <img
                          src={obtenerImagenProducto(producto)}
                          alt={producto.nombre}
                        />
                      </Link>
                    </div>
                    <div className="card-body d-flex flex-column p-3">
                      <span className="badge-categoria-pill align-self-start mb-2">
                        {obtenerNombreCategoria(producto.categoria)}
                      </span>
                      <h5 className="fw-bold fs-6 mb-1">
                        <Link
                          to={`/productos/${producto.id}`}
                          className="text-dark text-decoration-none hover-link"
                        >
                          {producto.nombre}
                        </Link>
                      </h5>
                      <p className="text-muted small flex-grow-1 mb-3">
                        {producto.descripcion}
                      </p>
                      <div className="d-flex justify-content-between align-items-center pt-2 border-top border-light-subtle">
                        <span className="precio-producto">
                          {formatearPrecioCLP(producto.precio)}
                        </span>
                        <Link
                          to={`/productos/${producto.id}`}
                          className="btn btn-sm btn-fashion rounded-pill px-3"
                        >
                          Ver prenda
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="lookbook-banner my-5">
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <span className="hero-eyebrow mb-2">Compra ágil</span>
              <h2 className="font-editorial display-6 fw-bold mb-2">
                Arma tu outfit y haz seguimiento al instante
              </h2>
              <p className="text-white-50 mb-0">
                Compra con o sin cuenta registrada, elige tu talla ideal y
                consulta el estado de tus pedidos en cualquier momento desde Mis
                Compras.
              </p>
            </div>
            <div className="col-lg-4 text-lg-end">
              <div className="d-flex flex-wrap gap-2 justify-content-lg-end">
                <Link
                  to="/productos"
                  className="btn btn-gold rounded-pill px-4 py-2 fw-bold"
                >
                  Ir al Catálogo
                </Link>
                <Link
                  to="/mis-compras"
                  className="btn btn-outline-light rounded-pill px-4 py-2"
                >
                  Mis Compras
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
