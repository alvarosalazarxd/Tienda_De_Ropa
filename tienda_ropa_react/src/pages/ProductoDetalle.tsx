import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import ProductoService, {
  formatearPrecioCLP,
  obtenerImagenProducto,
  obtenerNombreCategoria,
  obtenerTallasProducto,
  Producto
} from '../services/producto.service';
import useCarrito from '../hooks/useCarrito';

const ProductoDetalle = () => {
  const { id } = useParams<{ id: string }>();
  const { agregarAlCarrito } = useCarrito();

  const [producto, setProducto] = useState<Producto | null>(null);
  const [talla, setTalla] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  useEffect(() => {
    const cargarProducto = async () => {
      if (!id) {
        setError('Identificador de producto inválido.');
        return;
      }
      const numericId = Number(id);
      if (Number.isNaN(numericId)) {
        setError('Identificador de producto inválido.');
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await ProductoService.obtener(numericId);
        setProducto(data);
        const tallasDisponibles = obtenerTallasProducto(data);
        setTalla(tallasDisponibles[0] ?? 'Única');
      } catch (err) {
        console.error(err);
        setError('No se pudo cargar el producto seleccionado.');
      } finally {
        setLoading(false);
      }
    };

    void cargarProducto();
  }, [id]);

  const handleAgregar = async () => {
    if (!producto) return;
    if (cantidad < 1 || cantidad > producto.stock) {
      setError('La cantidad supera el stock disponible.');
      return;
    }

    setError(null);
    try {
      await agregarAlCarrito(producto.id, producto.precio, cantidad, talla);
      setMensaje('Producto añadido al carrito exitosamente.');
    } catch {
      setError('No fue posible agregar el producto al carrito.');
    }
  };

  if (loading) {
    return (
      <main className="container my-5">
        <p>Cargando producto...</p>
      </main>
    );
  }

  if (error && !producto) {
    return (
      <main className="container my-5">
        <div className="alert alert-warning">{error}</div>
        <Link to="/productos" className="btn btn-dark">
          Volver al catálogo
        </Link>
      </main>
    );
  }

  if (!producto) return null;

  const tallas = obtenerTallasProducto(producto);
  const sinStock = producto.stock <= 0;

  return (
    <main className="container my-5">
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/" className="text-decoration-none text-dark">
              Inicio
            </Link>
          </li>
          <li className="breadcrumb-item">
            <Link to="/productos" className="text-decoration-none text-dark">
              Productos
            </Link>
          </li>
          <li className="breadcrumb-item active text-gold-deep fw-bold">
            {producto.nombre}
          </li>
        </ol>
      </nav>

      <section className="card card-custom border-0 shadow-sm p-4 p-lg-5">
        <div className="row g-4 g-lg-5 align-items-center">
          <div className="col-md-6">
            <div className="detalle-imagen-frame shadow-sm position-relative">
              {sinStock && (
                <span className="badge bg-danger position-absolute top-0 start-0 m-3 px-3 py-2 rounded-pill">
                  Agotado
                </span>
              )}
              <img
                src={obtenerImagenProducto(producto)}
                alt={producto.nombre}
              />
            </div>
          </div>

          <div className="col-md-6">
            <span className="badge-categoria-pill d-inline-block mb-3">
              {obtenerNombreCategoria(producto.categoria)}
            </span>

            <h1 className="font-editorial fw-bold display-5 mb-1">
              {producto.nombre}
            </h1>
            <p className="text-muted small mb-3">
              Código de referencia: #{String(producto.id).padStart(3, '0')}
            </p>

            <h2 className="fw-bold display-6 my-3 text-dark">
              {formatearPrecioCLP(producto.precio)}
            </h2>

            <p className="card-text text-secondary mb-4 lh-base">
              {producto.descripcion}
            </p>

            <div className="mb-4">
              <label className="form-label fw-bold small text-uppercase text-muted d-block mb-2">
                Seleccionar talla
              </label>
              <div className="d-flex flex-wrap gap-2">
                {tallas.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`talla-btn ${talla === t ? 'active' : ''}`}
                    onClick={() => setTalla(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-3">
              <label
                htmlFor="cantidadInput"
                className="form-label fw-bold small text-uppercase text-muted d-block mb-2"
              >
                Cantidad
              </label>
              <div className="input-group" style={{ width: '140px' }}>
                <button
                  type="button"
                  className="btn btn-outline-dark"
                  disabled={sinStock || cantidad <= 1}
                  onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                >
                  −
                </button>
                <input
                  id="cantidadInput"
                  type="number"
                  className="form-control text-center fw-semibold"
                  min={1}
                  max={Math.max(1, producto.stock)}
                  value={cantidad}
                  disabled={sinStock}
                  onChange={(e) =>
                    setCantidad(
                      Math.min(
                        Math.max(1, producto.stock),
                        Math.max(1, Number(e.target.value) || 1)
                      )
                    )
                  }
                />
                <button
                  type="button"
                  className="btn btn-outline-dark"
                  disabled={sinStock || cantidad >= producto.stock}
                  onClick={() =>
                    setCantidad((c) => Math.min(producto.stock, c + 1))
                  }
                >
                  +
                </button>
              </div>
            </div>

            <div className="mb-4">
              <span
                className={`badge rounded-pill px-3 py-2 ${
                  sinStock
                    ? 'bg-danger-subtle text-danger border border-danger-subtle'
                    : producto.stock <= 5
                      ? 'bg-warning-subtle text-dark border border-warning-subtle'
                      : 'bg-success-subtle text-success border border-success-subtle'
                }`}
              >
                <i
                  className={`bi ${
                    sinStock ? 'bi-x-circle' : 'bi-check2-circle'
                  } me-1`}
                ></i>
                {sinStock
                  ? 'Sin stock disponible'
                  : `Disponible · ${producto.stock} unidades en inventario`}
              </span>
            </div>

            {error && <div className="alert alert-danger py-2">{error}</div>}
            {mensaje && (
              <div className="alert alert-success py-2">{mensaje}</div>
            )}

            <div className="d-flex flex-wrap gap-2 mb-4">
              <button
                type="button"
                className="btn btn-fashion btn-lg rounded-pill px-4 fw-bold"
                disabled={sinStock}
                onClick={() => void handleAgregar()}
              >
                <i className="bi bi-bag-plus me-2"></i>
                Añadir al Carrito
              </button>

              <Link
                to="/productos"
                className="btn btn-outline-dark btn-lg rounded-pill px-4"
              >
                Volver al Catálogo
              </Link>
            </div>

            <div className="row g-2">
              <div className="col-sm-4">
                <div className="trust-mini-box h-100">
                  <i className="bi bi-truck text-gold-deep d-block fs-5 mb-1"></i>
                  <strong className="d-block">Despacho rápido</strong>
                  <span className="text-muted">A todo Chile</span>
                </div>
              </div>
              <div className="col-sm-4">
                <div className="trust-mini-box h-100">
                  <i className="bi bi-shield-check text-gold-deep d-block fs-5 mb-1"></i>
                  <strong className="d-block">Pago seguro</strong>
                  <span className="text-muted">Compra protegida</span>
                </div>
              </div>
              <div className="col-sm-4">
                <div className="trust-mini-box h-100">
                  <i className="bi bi-arrow-repeat text-gold-deep d-block fs-5 mb-1"></i>
                  <strong className="d-block">Cambios ágiles</strong>
                  <span className="text-muted">Garantía de talla</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ProductoDetalle;
