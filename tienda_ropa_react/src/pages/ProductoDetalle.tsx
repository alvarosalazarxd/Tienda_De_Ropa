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
          <li className="breadcrumb-item active text-gold fw-bold">
            {producto.nombre}
          </li>
        </ol>
      </nav>

      <section className="card card-custom border-0 shadow-sm p-4">
        <div className="row g-4 align-items-center">
          <div className="col-md-6">
            <img
              src={obtenerImagenProducto(producto)}
              alt={producto.nombre}
              className="img-fluid rounded-3 shadow-sm w-100"
              style={{ maxHeight: '480px', objectFit: 'cover' }}
            />
          </div>

          <div className="col-md-6">
            <span className="badge bg-dark text-gold border border-gold mb-2 px-3 py-2 text-uppercase">
              {obtenerNombreCategoria(producto.categoria)}
            </span>

            <h1 className="fw-bold display-6 mb-1">{producto.nombre}</h1>
            <p className="text-muted fs-6 mb-3">
              Ref: #{String(producto.id).padStart(3, '0')}
            </p>

            <h2 className="text-gold fw-bold display-6 my-3">
              {formatearPrecioCLP(producto.precio)}
            </h2>

            <p className="card-text text-secondary mb-4">
              {producto.descripcion}
            </p>

            <div className="mb-3">
              <label htmlFor="tallaSelect" className="form-label fw-bold">
                Seleccionar Talla:
              </label>
              <select
                id="tallaSelect"
                className="form-select w-50"
                value={talla}
                onChange={(e) => setTalla(e.target.value)}
              >
                {tallas.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label htmlFor="cantidadInput" className="form-label fw-bold">
                Cantidad:
              </label>
              <input
                id="cantidadInput"
                type="number"
                className="form-control w-25"
                min={1}
                max={Math.max(1, producto.stock)}
                value={cantidad}
                disabled={sinStock}
                onChange={(e) =>
                  setCantidad(Math.max(1, Number(e.target.value) || 1))
                }
              />
            </div>

            <p
              className={`small mb-4 ${
                sinStock ? 'text-danger fw-bold' : 'text-muted'
              }`}
            >
              {sinStock
                ? 'Producto sin stock disponible.'
                : `Quedan ${producto.stock} unidades disponibles.`}
            </p>

            {error && <div className="alert alert-danger py-2">{error}</div>}
            {mensaje && (
              <div className="alert alert-success py-2">{mensaje}</div>
            )}

            <div className="d-grid gap-2 d-md-block">
              <button
                type="button"
                className="btn btn-fashion btn-lg rounded-pill px-4 me-md-2 fw-bold"
                disabled={sinStock}
                onClick={() => void handleAgregar()}
              >
                <i className="bi bi-cart-plus me-2"></i>
                Añadir al Carrito
              </button>

              <Link
                to="/productos"
                className="btn btn-outline-dark btn-lg rounded-pill px-4"
              >
                Volver al Catálogo
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ProductoDetalle;
