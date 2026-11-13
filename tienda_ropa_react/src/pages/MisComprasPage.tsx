import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import usePedidos from '../hooks/usePedidos';
import useProductos from '../hooks/useProductos';
import ProductoService, {
  formatearPrecioCLP,
  Producto
} from '../services/producto.service';
import PedidoService, {
  EstadoPedido,
  formatearFechaPedido,
  obtenerDespachoPedido,
  Pedido
} from '../services/pedido.service';
import { obtenerSesionUsuario } from '../services/usuario.service';

function claseBadgeEstado(estado: EstadoPedido): string {
  switch (estado) {
    case 'PAGADO':
      return 'bg-success';
    case 'PENDIENTE':
      return 'bg-warning text-dark';
    case 'CANCELADO':
      return 'bg-danger';
    default:
      return 'bg-secondary';
  }
}

const MisComprasPage = () => {
  const sesion = obtenerSesionUsuario();
  const { pedidos, loading, error, recargar } = usePedidos(
    sesion ? sesion.id : null
  );
  const { productos } = useProductos();
  const [mensaje, setMensaje] = useState<string | null>(null);

  const mapaProductos = useMemo(() => {
    const mapa = new Map<number, Producto>();
    productos.forEach((p) => mapa.set(p.id, p));
    return mapa;
  }, [productos]);

  const handleCancelarPedido = async (pedido: Pedido) => {
    if (
      !window.confirm(
        `¿Deseas cancelar el pedido #${pedido.id}? Se devolverá el stock al catálogo.`
      )
    ) {
      return;
    }

    try {
      await PedidoService.cancelar(pedido.id);
      // Devolvemos las unidades al inventario del microservicio de productos
      for (const item of pedido.items) {
        await ProductoService.aumentarStock(item.productoId, item.cantidad);
      }
      setMensaje(`El pedido #${pedido.id} fue cancelado.`);
      await recargar();
    } catch {
      setMensaje('No fue posible cancelar el pedido.');
    }
  };

  return (
    <main className="container my-5" style={{ maxWidth: '850px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 fw-bold mb-1">Mis Compras</h1>
          <p className="text-muted small mb-0">
            Revisa el estado de tus pedidos e historial de compras.
          </p>
        </div>
        <Link to="/productos" className="btn btn-outline-dark btn-sm">
          <i className="bi bi-arrow-left me-1"></i>
          Volver a la tienda
        </Link>
      </div>

      {!sesion ? (
        <div className="alert alert-warning text-center">
          Debes iniciar sesión para ver tu historial de compras.{' '}
          <Link to="/login" className="alert-link">
            Iniciar sesión
          </Link>
        </div>
      ) : (
        <>
          {mensaje && (
            <div className="alert alert-info alert-dismissible fade show">
              {mensaje}
              <button
                type="button"
                className="btn-close"
                onClick={() => setMensaje(null)}
              ></button>
            </div>
          )}

          {error && (
            <div className="alert alert-danger">
              No se pudo conectar con el servicio de pedidos a través del Gateway (puerto 8080).
            </div>
          )}

          {loading && <p>Cargando historial de compras...</p>}

          {!loading && pedidos.length === 0 ? (
            <div className="alert alert-light text-center border py-4">
              Aún no has realizado ninguna compra con tu cuenta.
            </div>
          ) : (
            pedidos.map((pedido) => {
              const despacho = obtenerDespachoPedido(pedido.id);
              return (
                <div key={pedido.id} className="card mb-3 border-0 shadow-sm">
                  <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
                    <div>
                      <span className="fw-bold text-dark me-2">
                        Pedido #{pedido.id}
                      </span>
                      <small className="text-muted">
                        ({formatearFechaPedido(pedido.fecha)})
                      </small>
                    </div>
                    <span
                      className={`badge ${claseBadgeEstado(pedido.estado)}`}
                    >
                      {pedido.estado}
                    </span>
                  </div>

                  <div className="card-body">
                    {despacho && (
                      <div className="row mb-3 small text-muted">
                        <div className="col-md-6">
                          <strong>Envío a:</strong> {despacho.direccion},{' '}
                          {despacho.comunaRegion}
                        </div>
                        <div className="col-md-6 text-md-end">
                          <strong>Método de pago:</strong> {despacho.metodoPago}
                        </div>
                      </div>
                    )}

                    <div className="table-responsive">
                      <table className="table table-sm align-middle mb-0">
                        <tbody>
                          {pedido.items.map((item, idx) => {
                            const prod = mapaProductos.get(item.productoId);
                            const nombreProd =
                              prod?.nombre ?? `Producto #${item.productoId}`;
                            const talla =
                              despacho?.tallasPorProducto?.[
                                String(item.productoId)
                              ] ?? 'Única';
                            const subtotal =
                              item.subtotal ??
                              item.cantidad * item.precioUnitario;

                            return (
                              <tr key={item.id ?? idx}>
                                <td>
                                  {nombreProd}{' '}
                                  <span className="badge bg-light text-dark border ms-1">
                                    {talla}
                                  </span>
                                </td>
                                <td className="text-center">
                                  x{item.cantidad}
                                </td>
                                <td className="text-end fw-semibold">
                                  {formatearPrecioCLP(subtotal)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <hr className="my-2" />

                    <div className="d-flex justify-content-between align-items-center pt-2">
                      <div>
                        {pedido.estado === 'PENDIENTE' && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => void handleCancelarPedido(pedido)}
                          >
                            Cancelar pedido
                          </button>
                        )}
                      </div>
                      <div>
                        <span className="fw-bold me-2">Total:</span>
                        <span className="fs-5 fw-bold text-dark">
                          {formatearPrecioCLP(pedido.total)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </>
      )}
    </main>
  );
};

export default MisComprasPage;
