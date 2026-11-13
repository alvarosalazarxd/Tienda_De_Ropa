import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import useCarrito from '../hooks/useCarrito';
import useProductos from '../hooks/useProductos';
import {
  obtenerTallaItemCarrito,
  obtenerUsuarioIdCarrito
} from '../services/carrito.service';
import {
  formatearPrecioCLP,
  obtenerImagenProducto,
  Producto
} from '../services/producto.service';

const CarritoPage = () => {
  const navigate = useNavigate();
  const { carrito, loading, error, cambiarCantidad, quitarItem, vaciar } =
    useCarrito();
  const { productos } = useProductos();
  const [aviso, setAviso] = useState<string | null>(null);

  const usuarioId = obtenerUsuarioIdCarrito();

  const mapaProductos = useMemo(() => {
    const mapa = new Map<number, Producto>();
    productos.forEach((p) => mapa.set(p.id, p));
    return mapa;
  }, [productos]);

  const items = carrito?.items ?? [];
  const total = carrito?.total ?? 0;

  const handleCambiarCantidad = async (
    itemId: number,
    productoId: number,
    valor: number
  ) => {
    if (!Number.isInteger(valor) || valor < 1) return;
    const prod = mapaProductos.get(productoId);
    if (prod && valor > prod.stock) {
      setAviso(`Solo quedan ${prod.stock} unidades disponibles de ${prod.nombre}.`);
      return;
    }
    setAviso(null);
    await cambiarCantidad(itemId, valor);
  };

  const handleVaciar = async () => {
    if (window.confirm('¿Estás seguro de que deseas vaciar tu carrito?')) {
      await vaciar();
    }
  };

  return (
    <div>
      <header className="catalogo-header mb-4">
        <div className="container">
          <span className="text-gold fw-semibold text-uppercase small">
            Moda &amp; Estilo
          </span>
          <h1 className="fw-bold text-uppercase mb-0 mt-1">
            <i className="bi bi-bag me-2 text-gold"></i>
            Tu Bolsa de Compras
          </h1>
          <div className="catalogo-linea"></div>
        </div>
      </header>

      <main className="container my-4">
        {error && (
          <div className="alert alert-danger">
            No se pudo conectar con el servicio de carrito a través del Gateway
            (puerto 8080 / Carrito 8084).
          </div>
        )}

        {aviso && (
          <div className="alert alert-warning alert-dismissible fade show">
            {aviso}
            <button
              type="button"
              className="btn-close"
              onClick={() => setAviso(null)}
            ></button>
          </div>
        )}

        {items.length === 0 && !loading ? (
          <div className="text-center py-5">
            <i className="bi bi-cart-x text-muted display-1"></i>
            <h3 className="mt-3 fw-bold text-dark">Tu carrito está vacío</h3>
            <p className="text-muted">
              Parece que aún no has añadido prendas a tu orden.
            </p>
            <Link
              to="/productos"
              className="btn btn-fashion rounded-pill px-4 mt-2 fw-bold"
            >
              <i className="bi bi-bag-plus me-2"></i>
              Explorar Catálogo
            </Link>
          </div>
        ) : (
          <div className="row g-4">
            <div className="col-12 col-lg-8">
              <div className="card card-custom shadow-sm border-0 rounded-3 overflow-hidden">
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-dark">
                        <tr>
                          <th scope="col" style={{ minWidth: '200px' }}>
                            Producto
                          </th>
                          <th scope="col">Precio</th>
                          <th scope="col" style={{ width: '130px' }}>
                            Cantidad
                          </th>
                          <th scope="col">Subtotal</th>
                          <th
                            scope="col"
                            className="text-end"
                            style={{ width: '50px' }}
                          ></th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item) => {
                          const prod = mapaProductos.get(item.productoId);
                          const nombre =
                            prod?.nombre ?? `Producto #${item.productoId}`;
                          const imagen = prod
                            ? obtenerImagenProducto(prod)
                            : '/img/urbana.jpg';
                          const talla = obtenerTallaItemCarrito(
                            usuarioId,
                            item.productoId
                          );

                          return (
                            <tr key={item.id}>
                              <td>
                                <div className="d-flex align-items-center">
                                  <img
                                    src={imagen}
                                    alt={nombre}
                                    className="img-fluid rounded me-3"
                                    style={{
                                      width: '50px',
                                      height: '50px',
                                      objectFit: 'cover'
                                    }}
                                  />
                                  <div>
                                    <h6 className="mb-0 fw-bold">{nombre}</h6>
                                    <small className="text-muted">
                                      Talla: {talla}
                                    </small>
                                  </div>
                                </div>
                              </td>
                              <td>{formatearPrecioCLP(item.precioUnitario)}</td>
                              <td>
                                <input
                                  type="number"
                                  className="form-control form-control-sm"
                                  style={{ width: '75px' }}
                                  min={1}
                                  max={prod ? Math.max(1, prod.stock) : 20}
                                  value={item.cantidad}
                                  disabled={loading}
                                  onChange={(e) =>
                                    void handleCambiarCantidad(
                                      item.id,
                                      item.productoId,
                                      Number(e.target.value)
                                    )
                                  }
                                />
                              </td>
                              <td className="fw-bold">
                                {formatearPrecioCLP(item.subtotal)}
                              </td>
                              <td className="text-end">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger"
                                  title="Eliminar producto"
                                  disabled={loading}
                                  onClick={() => void quitarItem(item.id)}
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center mt-3">
                <Link
                  to="/productos"
                  className="btn btn-outline-dark btn-sm rounded-pill"
                >
                  <i className="bi bi-arrow-left me-1"></i>
                  Seguir Comprando
                </Link>
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm rounded-pill"
                  disabled={loading}
                  onClick={() => void handleVaciar()}
                >
                  <i className="bi bi-trash me-1"></i>
                  Vaciar Carrito
                </button>
              </div>
            </div>

            <div className="col-12 col-lg-4">
              <div className="card card-custom shadow-sm border-0 rounded-3 p-3">
                <h5 className="fw-bold border-bottom pb-2 text-uppercase fs-6">
                  Resumen del Pedido
                </h5>

                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Subtotal</span>
                  <span className="fw-semibold">
                    {formatearPrecioCLP(total)}
                  </span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Envío</span>
                  <span className="text-success fw-semibold">Gratis</span>
                </div>

                <hr className="my-2" />

                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="fw-bold fs-5">Total</span>
                  <span className="fs-4 fw-bold text-dark">
                    {formatearPrecioCLP(total)}
                  </span>
                </div>

                <button
                  type="button"
                  className="btn btn-fashion w-100 py-2 rounded-pill fw-bold text-uppercase"
                  disabled={items.length === 0 || loading}
                  onClick={() => navigate('/checkout')}
                >
                  <i className="bi bi-credit-card me-2"></i>
                  Proceder al Pago
                </button>

                <div className="mt-3 text-center text-muted small">
                  <i className="bi bi-shield-lock text-gold me-1"></i>
                  Transacción 100% Encriptada y Segura
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CarritoPage;
