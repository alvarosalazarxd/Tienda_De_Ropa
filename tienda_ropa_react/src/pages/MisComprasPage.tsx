import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import usePedidos from '../hooks/usePedidos';
import useProductos from '../hooks/useProductos';
import { extraerMensajeError } from '../services/api.config';
import ProductoService, {
  formatearPrecioCLP,
  Producto
} from '../services/producto.service';
import PedidoService, {
  formatearFechaPedido,
  obtenerClaseBadgeEstadoPedido,
  obtenerDespachoPedido,
  obtenerEtiquetaEstadoPedido,
  obtenerNombreItemPedido,
  Pedido
} from '../services/pedido.service';
import { obtenerUsuarioIdCarrito } from '../services/carrito.service';
import { obtenerSesionUsuario } from '../services/usuario.service';

const MisComprasPage = () => {
  const sesion = obtenerSesionUsuario();
  const usuarioComprasId = sesion ? sesion.id : obtenerUsuarioIdCarrito();
  const { pedidos, loading, error, recargar } = usePedidos(usuarioComprasId);
  const { productos } = useProductos(true);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);

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

    setErrorAccion(null);
    setMensaje(null);
    try {
      await PedidoService.cancelar(pedido.id, 'Cancelado por el cliente');
      // Devolvemos las unidades al inventario del microservicio de productos
      for (const item of pedido.items) {
        if (item.reembolsado) continue;
        try {
          await ProductoService.aumentarStock(item.productoId, item.cantidad);
        } catch {
          // Si un producto antiguo fue eliminado fisicamente, no bloqueamos la cancelacion
        }
      }
      setMensaje(`El pedido #${pedido.id} fue cancelado correctamente.`);
      await recargar();
    } catch (err) {
      setErrorAccion(
        extraerMensajeError(err, 'No fue posible cancelar el pedido.')
      );
    }
  };

  return (
    <main className="container my-5" style={{ maxWidth: '850px' }}>
      <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4 pb-3 border-bottom">
        <div>
          <span className="section-eyebrow">Historial de pedidos</span>
          <h1 className="section-heading mb-1">Mis Compras</h1>
          <p className="text-muted small mb-0">
            Revisa el estado de tus pedidos y detalles de despacho.
          </p>
        </div>
        <Link to="/productos" className="btn btn-outline-dark btn-sm rounded-pill px-3">
          <i className="bi bi-arrow-left me-1"></i>
          Volver a la tienda
        </Link>
      </div>

      {!sesion && (
        <div className="alert alert-secondary d-flex flex-wrap justify-content-between align-items-center gap-2">
          <span>
            <i className="bi bi-info-circle me-2"></i>
            Mostrando compras realizadas sin iniciar sesión en este navegador.
          </span>
          <Link to="/login" className="btn btn-sm btn-outline-dark">
            Iniciar sesión
          </Link>
        </div>
      )}

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

          {errorAccion && (
            <div className="alert alert-danger alert-dismissible fade show">
              {errorAccion}
              <button
                type="button"
                className="btn-close"
                onClick={() => setErrorAccion(null)}
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
              {sesion
                ? 'Aún no has realizado ninguna compra con tu cuenta.'
                : 'Aún no has realizado compras desde este navegador.'}
            </div>
          ) : (
            pedidos.map((pedido) => {
              const despacho = obtenerDespachoPedido(pedido.id);
              const direccionMostrar = pedido.direccion || despacho?.direccion;
              const comunaMostrar =
                pedido.comunaRegion || despacho?.comunaRegion;
              const metodoPagoMostrar =
                pedido.metodoPago || despacho?.metodoPago || 'No informado';
              const montoReembolsado = pedido.montoReembolsado ?? 0;
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
                      className={`badge ${obtenerClaseBadgeEstadoPedido(pedido.estado)}`}
                    >
                      {obtenerEtiquetaEstadoPedido(pedido.estado)}
                    </span>
                  </div>

                  <div className="card-body">
                    {(direccionMostrar || metodoPagoMostrar) && (
                      <div className="row mb-3 small text-muted">
                        <div className="col-md-6">
                          {direccionMostrar && (
                            <>
                              <strong>Envío a:</strong> {direccionMostrar}
                              {comunaMostrar ? `, ${comunaMostrar}` : ''}
                            </>
                          )}
                        </div>
                        <div className="col-md-6 text-md-end">
                          <strong>Método de pago:</strong> {metodoPagoMostrar}
                        </div>
                      </div>
                    )}

                    {pedido.estado === 'PENDIENTE' &&
                      metodoPagoMostrar.toLowerCase().includes('transferencia') && (
                        <div className="alert alert-warning py-2 px-3 small mb-3">
                          <i className="bi bi-clock-history me-2"></i>
                          Tu compra por transferencia está{' '}
                          <strong>pendiente de verificación</strong> por el
                          administrador. Una vez confirmado el pago pasará a{' '}
                          <strong>Pagado</strong>.
                        </div>
                      )}

                    {montoReembolsado > 0 && (
                      <div className="alert alert-info py-2 px-3 small mb-3">
                        <i className="bi bi-arrow-counterclockwise me-2"></i>
                        <strong>
                          Reembolso emitido: {formatearPrecioCLP(montoReembolsado)}
                        </strong>
                        {pedido.motivoEstado && (
                          <span> — {pedido.motivoEstado}</span>
                        )}
                      </div>
                    )}

                    {pedido.estado === 'CANCELADO' && pedido.motivoEstado && (
                      <div className="alert alert-danger py-2 px-3 small mb-3">
                        <i className="bi bi-x-circle me-2"></i>
                        <strong>Motivo de cancelación:</strong>{' '}
                        {pedido.motivoEstado}
                      </div>
                    )}

                    <div className="table-responsive">
                      <table className="table table-sm align-middle mb-0">
                        <tbody>
                          {pedido.items.map((item, idx) => {
                            const nombreProd = obtenerNombreItemPedido(
                              item,
                              mapaProductos,
                              despacho
                            );
                            const talla =
                              item.talla ||
                              despacho?.tallasPorProducto?.[
                                String(item.productoId)
                              ] ||
                              'Única';
                            const subtotal =
                              item.subtotal ??
                              item.cantidad * item.precioUnitario;

                            return (
                              <tr
                                key={item.id ?? idx}
                                className={
                                  item.reembolsado ? 'table-light text-muted' : ''
                                }
                              >
                                <td>
                                  <span
                                    className={
                                      item.reembolsado
                                        ? 'text-decoration-line-through'
                                        : ''
                                    }
                                  >
                                    {nombreProd}
                                  </span>{' '}
                                  <span className="badge bg-light text-dark border ms-1">
                                    {talla}
                                  </span>
                                  {item.reembolsado && (
                                    <span className="badge bg-info text-dark ms-2">
                                      {pedido.estado === 'PENDIENTE' ||
                                      pedido.estado === 'CANCELADO'
                                        ? 'Retirado'
                                        : 'Reembolsado'}
                                    </span>
                                  )}
                                  {item.reembolsado && item.motivoReembolso && (
                                    <div className="small text-muted mt-1">
                                      Motivo: {item.motivoReembolso}
                                    </div>
                                  )}
                                </td>
                                <td className="text-center">
                                  x{item.cantidad}
                                </td>
                                <td className="text-end fw-semibold">
                                  <span
                                    className={
                                      item.reembolsado
                                        ? 'text-decoration-line-through'
                                        : ''
                                    }
                                  >
                                    {formatearPrecioCLP(subtotal)}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <hr className="my-2" />

                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 pt-2">
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
                      <div className="text-end">
                        <div>
                          <span className="fw-bold me-2">Total pedido:</span>
                          <span className="fs-5 fw-bold text-dark">
                            {formatearPrecioCLP(pedido.total)}
                          </span>
                        </div>
                        {montoReembolsado > 0 && (
                          <div className="small text-info-emphasis fw-semibold">
                            Reembolsado: −{formatearPrecioCLP(montoReembolsado)}{' '}
                            · Neto:{' '}
                            {formatearPrecioCLP(
                              Math.max(0, pedido.total - montoReembolsado)
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
      </>
    </main>
  );
};

export default MisComprasPage;
