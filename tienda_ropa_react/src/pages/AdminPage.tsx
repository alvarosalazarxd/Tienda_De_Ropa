import { FormEvent, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import useProductos from '../hooks/useProductos';
import usePedidos from '../hooks/usePedidos';
import useUsuarios from '../hooks/useUsuarios';
import ProductoService, {
  CategoriaProducto,
  formatearPrecioCLP,
  guardarExtrasProducto,
  obtenerImagenProducto,
  obtenerNombreCategoria,
  obtenerTallasProducto,
  Producto,
  ProductoPayload
} from '../services/producto.service';
import PedidoService, {
  EstadoPedido,
  formatearFechaPedido,
  obtenerDespachoPedido,
  Pedido
} from '../services/pedido.service';
import UsuarioService, {
  cerrarSesionUsuario,
  obtenerSesionUsuario,
  RolUsuario,
  Usuario
} from '../services/usuario.service';

type SeccionAdmin = 'dashboard' | 'pedidos' | 'productos' | 'usuarios';

interface FormProductoAdmin {
  idEditar: number | null;
  nombre: string;
  categoria: CategoriaProducto;
  precio: string;
  stock: string;
  stockMinimo: string;
  imagen: string;
  descripcion: string;
  tallas: string;
}

const formProductoInicial: FormProductoAdmin = {
  idEditar: null,
  nombre: '',
  categoria: 'URBANO',
  precio: '',
  stock: '',
  stockMinimo: '5',
  imagen: '',
  descripcion: '',
  tallas: 'S - Small, M - Medium, L - Large'
};

function calcularBadgeStock(producto: Producto): {
  texto: string;
  clase: string;
} {
  if (producto.stock <= 0) return { texto: 'Agotado', clase: 'bg-danger' };
  if (producto.stock <= producto.stockMinimo) {
    return { texto: 'Poco Stock', clase: 'bg-warning text-dark' };
  }
  return { texto: 'Disponible', clase: 'bg-success' };
}

function claseBadgePedido(estado: EstadoPedido): string {
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

const AdminPage = () => {
  const navigate = useNavigate();
  const sesion = obtenerSesionUsuario();

  // Hooks personalizados conectados a los 3 microservicios administrativos
  const {
    productos,
    loading: loadingProductos,
    error: errorProductos,
    recargar: recargarProductos
  } = useProductos();
  const {
    pedidos,
    loading: loadingPedidos,
    error: errorPedidos,
    recargar: recargarPedidos
  } = usePedidos();
  const {
    usuarios,
    loading: loadingUsuarios,
    error: errorUsuarios,
    recargar: recargarUsuarios
  } = useUsuarios();

  const [seccion, setSeccion] = useState<SeccionAdmin>('dashboard');
  const [aviso, setAviso] = useState<string | null>(null);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);

  // Estados para gestion de pedidos
  const [filtroPedidoTexto, setFiltroPedidoTexto] = useState('');
  const [filtroPedidoEstado, setFiltroPedidoEstado] = useState('TODOS');
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(
    null
  );
  const [nuevoEstadoModal, setNuevoEstadoModal] =
    useState<EstadoPedido>('PENDIENTE');

  // Estados para modal crear / editar producto
  const [mostrarModalProducto, setMostrarModalProducto] = useState(false);
  const [formProd, setFormProd] =
    useState<FormProductoAdmin>(formProductoInicial);
  const [guardandoProd, setGuardandoProd] = useState(false);

  const mapaUsuarios = useMemo(() => {
    const mapa = new Map<number, Usuario>();
    usuarios.forEach((u) => mapa.set(u.id, u));
    return mapa;
  }, [usuarios]);

  const mapaProductos = useMemo(() => {
    const mapa = new Map<number, Producto>();
    productos.forEach((p) => mapa.set(p.id, p));
    return mapa;
  }, [productos]);

  // Metricas del Dashboard calculadas en vivo desde MySQL
  const totalStock = useMemo(
    () => productos.reduce((acc, p) => acc + (p.stock || 0), 0),
    [productos]
  );

  const alertasStock = useMemo(
    () => productos.filter((p) => p.stock <= p.stockMinimo).length,
    [productos]
  );

  const ventasMes = useMemo(() => {
    const ahora = new Date();
    return pedidos
      .filter((p) => {
        if (p.estado !== 'PAGADO') return false;
        const f = new Date(p.fecha);
        if (Number.isNaN(f.getTime())) return true;
        return (
          f.getFullYear() === ahora.getFullYear() &&
          f.getMonth() === ahora.getMonth()
        );
      })
      .reduce((acc, p) => acc + (p.total || 0), 0);
  }, [pedidos]);

  const datosUltimos7Dias = useMemo(() => {
    const hoy = new Date();
    return Array.from({ length: 7 }, (_, idx) => {
      const dia = new Date(
        hoy.getFullYear(),
        hoy.getMonth(),
        hoy.getDate() - 6 + idx
      );
      const etiqueta = dia.toLocaleDateString('es-CL', {
        day: '2-digit',
        month: '2-digit'
      });
      const monto = pedidos
        .filter((p) => {
          if (p.estado !== 'PAGADO') return false;
          const f = new Date(p.fecha);
          return (
            f.getFullYear() === dia.getFullYear() &&
            f.getMonth() === dia.getMonth() &&
            f.getDate() === dia.getDate()
          );
        })
        .reduce((sum, p) => sum + (p.total || 0), 0);
      return { etiqueta, monto };
    });
  }, [pedidos]);

  const maxVentaDia = Math.max(
    1,
    ...datosUltimos7Dias.map((d) => d.monto)
  );

  // Filtro de pedidos
  const pedidosFiltrados = useMemo(() => {
    return pedidos.filter((p) => {
      const despacho = obtenerDespachoPedido(p.id);
      const usuario = mapaUsuarios.get(p.usuarioId);
      const nombreCliente =
        despacho?.clienteNombre || usuario?.nombre || `Usuario #${p.usuarioId}`;
      const texto = filtroPedidoTexto.trim().toLowerCase();
      const coincideTexto =
        !texto ||
        String(p.id).includes(texto) ||
        nombreCliente.toLowerCase().includes(texto);
      const coincideEstado =
        filtroPedidoEstado === 'TODOS' || p.estado === filtroPedidoEstado;
      return coincideTexto && coincideEstado;
    });
  }, [pedidos, filtroPedidoTexto, filtroPedidoEstado, mapaUsuarios]);

  const abrirAgregarProducto = () => {
    setFormProd(formProductoInicial);
    setMostrarModalProducto(true);
  };

  const abrirEditarProducto = (p: Producto) => {
    setFormProd({
      idEditar: p.id,
      nombre: p.nombre,
      categoria: p.categoria,
      precio: String(p.precio),
      stock: String(p.stock),
      stockMinimo: String(p.stockMinimo),
      imagen: obtenerImagenProducto(p),
      descripcion: p.descripcion,
      tallas: obtenerTallasProducto(p).join(', ')
    });
    setMostrarModalProducto(true);
  };

  const handleGuardarProducto = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setGuardandoProd(true);
    setErrorAccion(null);
    setAviso(null);

    const payload: ProductoPayload = {
      nombre: formProd.nombre.trim(),
      descripcion: formProd.descripcion.trim(),
      precio: Number(formProd.precio) || 0,
      categoria: formProd.categoria,
      stock: Number.parseInt(formProd.stock, 10) || 0,
      stockMinimo: Number.parseInt(formProd.stockMinimo, 10) || 0
    };

    if (!payload.nombre || !payload.descripcion || payload.precio <= 0) {
      setErrorAccion('Completa nombre, descripción y un precio mayor a 0.');
      setGuardandoProd(false);
      return;
    }

    try {
      let guardado: Producto;
      if (formProd.idEditar !== null) {
        guardado = await ProductoService.actualizar(formProd.idEditar, payload);
        setAviso('Producto actualizado correctamente en MySQL.');
      } else {
        guardado = await ProductoService.crear(payload);
        setAviso('Producto creado correctamente en MySQL.');
      }

      const listaTallas = formProd.tallas
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      guardarExtrasProducto(guardado.id, {
        imagen: formProd.imagen.trim() || undefined,
        tallas: listaTallas.length > 0 ? listaTallas : undefined
      });

      setMostrarModalProducto(false);
      await recargarProductos();
    } catch (err) {
      console.error(err);
      setErrorAccion('Ocurrió un error al guardar el producto en Spring Boot.');
    } finally {
      setGuardandoProd(false);
    }
  };

  const handleEliminarProducto = async (p: Producto) => {
    if (!window.confirm(`¿Eliminar "${p.nombre}" del catálogo?`)) return;
    setErrorAccion(null);
    try {
      await ProductoService.eliminar(p.id);
      setAviso(`Producto "${p.nombre}" eliminado.`);
      await recargarProductos();
    } catch {
      setErrorAccion('No fue posible eliminar el producto.');
    }
  };

  const abrirModalPedido = (p: Pedido) => {
    setPedidoSeleccionado(p);
    setNuevoEstadoModal(p.estado);
  };

  const handleActualizarEstadoPedido = async () => {
    if (!pedidoSeleccionado) return;
    if (nuevoEstadoModal === pedidoSeleccionado.estado) {
      setPedidoSeleccionado(null);
      return;
    }

    setErrorAccion(null);
    try {
      if (nuevoEstadoModal === 'CANCELADO') {
        await PedidoService.cancelar(pedidoSeleccionado.id);
        // Al cancelar un pedido pendiente reponemos el stock de cada prenda
        for (const item of pedidoSeleccionado.items) {
          await ProductoService.aumentarStock(item.productoId, item.cantidad);
        }
        await recargarProductos();
      } else {
        await PedidoService.cambiarEstado(
          pedidoSeleccionado.id,
          nuevoEstadoModal
        );
      }

      setAviso(
        `Estado del pedido #${pedidoSeleccionado.id} actualizado a ${nuevoEstadoModal}.`
      );
      setPedidoSeleccionado(null);
      await recargarPedidos();
    } catch {
      setErrorAccion(
        'Transición de estado no permitida (por ejemplo, un pedido pagado no se puede cancelar ni volver a pendiente).'
      );
    }
  };

  const handleToggleEstadoUsuario = async (u: Usuario) => {
    setErrorAccion(null);
    try {
      if (u.activo) {
        await UsuarioService.deshabilitar(u.id);
        setAviso(`Usuario ${u.nombre} deshabilitado.`);
      } else {
        await UsuarioService.habilitar(u.id);
        setAviso(`Usuario ${u.nombre} habilitado.`);
      }
      await recargarUsuarios();
    } catch {
      setErrorAccion('No se pudo actualizar el estado del usuario.');
    }
  };

  const handleCambiarRolUsuario = async (u: Usuario, nuevoRol: RolUsuario) => {
    setErrorAccion(null);
    try {
      await UsuarioService.cambiarRol(u.id, nuevoRol);
      setAviso(`Rol de ${u.nombre} actualizado a ${nuevoRol}.`);
      await recargarUsuarios();
    } catch {
      setErrorAccion('No se pudo cambiar el rol del usuario.');
    }
  };

  const handleCerrarSesionAdmin = () => {
    cerrarSesionUsuario();
    navigate('/login');
  };

  const nombreAdmin = sesion?.nombre ?? 'Administrador';
  const inicialesAdmin = nombreAdmin
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  // Validamos que solo un usuario con rol ADMIN pueda ver el panel
  if (!sesion || sesion.rol !== 'ADMIN') {
    return (
      <div className="container py-5 text-center" style={{ maxWidth: '520px' }}>
        <div className="card shadow-sm border-0 p-4 mt-5">
          <i className="bi bi-shield-lock-fill text-danger display-4 mb-3"></i>
          <h3 className="fw-bold">Acceso restringido</h3>
          <p className="text-muted">
            Debes iniciar sesión con una cuenta de administrador para entrar al
            panel de gestión.
          </p>
          <div className="d-flex justify-content-center gap-2 mt-2">
            <Link to="/login" className="btn btn-gold fw-bold px-4">
              Iniciar Sesión
            </Link>
            <Link to="/" className="btn btn-outline-dark px-4">
              Volver a la tienda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100">
      <aside id="sidebar">
        <div className="d-flex align-items-center justify-content-between p-3 mb-2 border-bottom border-secondary border-opacity-25">
          <Link
            to="/admin"
            className="navbar-brand fw-bold fs-6 text-white text-decoration-none"
          >
            <i className="bi bi-shield-lock-fill text-gold me-2"></i>
            MODA &amp; ESTILO
          </Link>
        </div>

        <div className="px-3 my-2 text-uppercase text-gold small fw-bold">
          Navegación Admin
        </div>
        <nav className="nav flex-column">
          <button
            type="button"
            className={`nav-link border-0 bg-transparent text-start ${
              seccion === 'dashboard' ? 'active' : ''
            }`}
            onClick={() => setSeccion('dashboard')}
          >
            <i className="bi bi-grid-1x2-fill"></i> Dashboard
          </button>
          <button
            type="button"
            className={`nav-link border-0 bg-transparent text-start ${
              seccion === 'pedidos' ? 'active' : ''
            }`}
            onClick={() => setSeccion('pedidos')}
          >
            <i className="bi bi-receipt"></i> Gestión Pedidos
          </button>
          <button
            type="button"
            className={`nav-link border-0 bg-transparent text-start ${
              seccion === 'productos' ? 'active' : ''
            }`}
            onClick={() => setSeccion('productos')}
          >
            <i className="bi bi-box-seam-fill"></i> Gestión Productos
          </button>
          <button
            type="button"
            className={`nav-link border-0 bg-transparent text-start ${
              seccion === 'usuarios' ? 'active' : ''
            }`}
            onClick={() => setSeccion('usuarios')}
          >
            <i className="bi bi-people-fill"></i> Usuarios Registrados
          </button>
        </nav>

        <div className="px-3 mt-4 my-2 text-uppercase text-gold small fw-bold">
          Sitio Público
        </div>
        <nav className="nav flex-column">
          <Link to="/" className="nav-link">
            <i className="bi bi-shop"></i> Ir al sitio público
          </Link>
          <Link to="/productos" className="nav-link">
            <i className="bi bi-bag"></i> Ver Productos
          </Link>
          <button
            type="button"
            className="nav-link border-0 bg-transparent text-start text-danger mt-3"
            onClick={handleCerrarSesionAdmin}
          >
            <i className="bi bi-box-arrow-right"></i> Cerrar Sesión
          </button>
        </nav>
      </aside>

      <div id="main-wrapper">
        <header className="top-header d-flex align-items-center justify-content-between shadow-sm">
          <div className="fw-semibold text-muted small">
            Panel conectado a Microservicios Spring Boot + MySQL
          </div>

          <div className="d-flex align-items-center gap-3">
            <span className="badge btn-gold">
              <i className="bi bi-star-fill me-1"></i> Modo Admin
            </span>
            <div className="vr"></div>
            <div className="d-flex align-items-center gap-2">
              <div className="navbar-custom text-gold rounded-circle d-flex align-items-center justify-content-center fw-bold border border-gold user-avatar">
                {inicialesAdmin || 'AD'}
              </div>
              <div className="d-none d-sm-block">
                <div className="fw-bold small lh-1">{nombreAdmin}</div>
                <small className="text-muted">Administrador</small>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4">
          {aviso && (
            <div className="alert alert-success alert-dismissible fade show">
              {aviso}
              <button
                type="button"
                className="btn-close"
                onClick={() => setAviso(null)}
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

          {(errorProductos || errorPedidos || errorUsuarios) && (
            <div className="alert alert-warning">
              Algunos microservicios no responden:{' '}
              {errorProductos && <span className="me-2">[Productos: 8085]</span>}
              {errorPedidos && <span className="me-2">[Pedidos: 8083]</span>}
              {errorUsuarios && <span>[Usuarios: 8081]</span>}
            </div>
          )}

          {/* SECCION DASHBOARD */}
          {seccion === 'dashboard' && (
            <section>
              <div className="mb-4">
                <h3 className="fw-bold m-0">Dashboard General</h3>
                <small className="text-muted">
                  Resumen ejecutivo e indicadores en tiempo real desde MySQL
                </small>
              </div>

              <div className="row g-3 mb-4">
                <div className="col-md-4">
                  <div className="p-3 card-metric-admin d-flex justify-content-between align-items-center shadow-sm">
                    <div>
                      <div className="text-uppercase text-gold small fw-bold">
                        TOTAL STOCK
                      </div>
                      <h3 className="mb-0 fw-bold mt-1">
                        {totalStock} prendas
                      </h3>
                    </div>
                    <i className="bi bi-box-seam fs-1 text-gold"></i>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="p-3 card-metric-admin d-flex justify-content-between align-items-center shadow-sm">
                    <div>
                      <div className="text-uppercase text-gold small fw-bold">
                        VENTAS REALES MES
                      </div>
                      <h3 className="mb-0 fw-bold mt-1">
                        {formatearPrecioCLP(ventasMes)}
                      </h3>
                    </div>
                    <i className="bi bi-currency-dollar fs-1 text-gold"></i>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="p-3 card-metric-admin d-flex justify-content-between align-items-center shadow-sm">
                    <div>
                      <div className="text-uppercase text-gold small fw-bold">
                        ALERTAS REPOSICIÓN
                      </div>
                      <h3 className="mb-0 fw-bold mt-1">
                        {alertasStock} ítems bajos
                      </h3>
                    </div>
                    <i className="bi bi-exclamation-triangle-fill fs-1 text-warning"></i>
                  </div>
                </div>
              </div>

              <div className="card border-0 shadow-sm p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h6 className="fw-bold m-0">
                    Ventas Pagadas - Últimos 7 días
                  </h6>
                  <span className="badge bg-light text-dark border">
                    Dinámico (ms-pedido)
                  </span>
                </div>

                <div
                  className="d-flex align-items-end justify-content-between gap-2 pt-3 border-bottom pb-2"
                  style={{ height: '220px' }}
                >
                  {datosUltimos7Dias.map((d) => {
                    const alturaPorcentaje = Math.max(
                      6,
                      Math.round((d.monto / maxVentaDia) * 100)
                    );
                    return (
                      <div
                        key={d.etiqueta}
                        className="d-flex flex-column align-items-center flex-fill h-100 justify-content-end"
                      >
                        <small className="text-muted mb-1" style={{ fontSize: '0.72rem' }}>
                          {d.monto > 0 ? formatearPrecioCLP(d.monto) : '$0'}
                        </small>
                        <div
                          className="w-50 rounded-top"
                          style={{
                            height: `${alturaPorcentaje}%`,
                            backgroundColor:
                              d.monto > 0 ? '#c5a880' : '#e5e7eb',
                            transition: 'height 0.3s ease'
                          }}
                        ></div>
                        <small className="mt-2 fw-semibold text-secondary">
                          {d.etiqueta}
                        </small>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* SECCION PEDIDOS */}
          {seccion === 'pedidos' && (
            <section>
              <div className="card shadow-sm border-0">
                <div className="card-header navbar-custom text-white d-flex flex-wrap justify-content-between align-items-center gap-2 py-3">
                  <h5 className="mb-0 fw-bold text-white">
                    <i className="bi bi-receipt text-gold me-2"></i>
                    Gestión de Pedidos
                  </h5>
                  <div className="d-flex gap-2">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Buscar N° o Cliente..."
                      value={filtroPedidoTexto}
                      onChange={(e) => setFiltroPedidoTexto(e.target.value)}
                    />
                    <select
                      className="form-select form-select-sm"
                      value={filtroPedidoEstado}
                      onChange={(e) => setFiltroPedidoEstado(e.target.value)}
                    >
                      <option value="TODOS">Todos los estados</option>
                      <option value="PENDIENTE">PENDIENTE</option>
                      <option value="PAGADO">PAGADO</option>
                      <option value="CANCELADO">CANCELADO</option>
                    </select>
                  </div>
                </div>

                <div className="card-body p-0 table-responsive bg-white">
                  <table className="table table-hover align-middle mb-0">
                    <thead>
                      <tr className="border-bottom">
                        <th className="py-3">N° Pedido</th>
                        <th className="py-3">Fecha</th>
                        <th className="py-3">Cliente</th>
                        <th className="py-3">Método Pago</th>
                        <th className="py-3">Total</th>
                        <th className="py-3">Estado</th>
                        <th className="py-3 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loadingPedidos && (
                        <tr>
                          <td colSpan={7} className="text-center py-4">
                            Cargando pedidos...
                          </td>
                        </tr>
                      )}
                      {!loadingPedidos && pedidosFiltrados.length === 0 && (
                        <tr>
                          <td
                            colSpan={7}
                            className="text-center py-4 text-muted"
                          >
                            No se encontraron pedidos registrados.
                          </td>
                        </tr>
                      )}
                      {pedidosFiltrados.map((p) => {
                        const despacho = obtenerDespachoPedido(p.id);
                        const usuario = mapaUsuarios.get(p.usuarioId);
                        const cliente =
                          despacho?.clienteNombre ||
                          usuario?.nombre ||
                          `Usuario #${p.usuarioId}`;
                        return (
                          <tr key={p.id}>
                            <td className="fw-bold text-gold">#{p.id}</td>
                            <td>{formatearFechaPedido(p.fecha)}</td>
                            <td>{cliente}</td>
                            <td>
                              <small className="text-muted">
                                {despacho?.metodoPago ?? 'Compra directa'}
                              </small>
                            </td>
                            <td className="fw-bold">
                              {formatearPrecioCLP(p.total)}
                            </td>
                            <td>
                              <span
                                className={`badge ${claseBadgePedido(
                                  p.estado
                                )}`}
                              >
                                {p.estado}
                              </span>
                            </td>
                            <td className="text-center">
                              <button
                                type="button"
                                className="btn btn-sm btn-gold"
                                onClick={() => abrirModalPedido(p)}
                              >
                                <i className="bi bi-eye-fill me-1"></i>
                                Ver Detalle
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* SECCION PRODUCTOS */}
          {seccion === 'productos' && (
            <section>
              <div className="card shadow-sm border-0">
                <div className="card-header navbar-custom text-white d-flex justify-content-between align-items-center py-3">
                  <h5 className="mb-0 fw-bold text-white">
                    <i className="bi bi-table text-gold me-2"></i>
                    Gestión de Stock de Productos
                  </h5>
                  <button
                    type="button"
                    className="btn btn-gold btn-sm fw-bold"
                    onClick={abrirAgregarProducto}
                  >
                    <i className="bi bi-plus-lg me-1"></i>
                    Agregar Producto
                  </button>
                </div>

                <div className="card-body p-0 table-responsive bg-white">
                  <table className="table table-hover align-middle mb-0">
                    <thead>
                      <tr className="border-bottom">
                        <th className="py-3">ID</th>
                        <th className="py-3">Producto</th>
                        <th className="py-3">Categoría</th>
                        <th className="py-3">Precio Unitario</th>
                        <th className="py-3">Stock Actual</th>
                        <th className="py-3">Estado</th>
                        <th className="py-3 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loadingProductos && (
                        <tr>
                          <td colSpan={7} className="text-center py-4">
                            Cargando productos...
                          </td>
                        </tr>
                      )}
                      {!loadingProductos && productos.length === 0 && (
                        <tr>
                          <td
                            colSpan={7}
                            className="text-center py-4 text-muted"
                          >
                            No hay productos en la base de datos.
                          </td>
                        </tr>
                      )}
                      {productos.map((p) => {
                        const badge = calcularBadgeStock(p);
                        return (
                          <tr key={p.id}>
                            <td>#{String(p.id).padStart(3, '0')}</td>
                            <td className="fw-bold">{p.nombre}</td>
                            <td>{obtenerNombreCategoria(p.categoria)}</td>
                            <td>{formatearPrecioCLP(p.precio)}</td>
                            <td>{p.stock} unidades</td>
                            <td>
                              <span className={`badge ${badge.clase}`}>
                                {badge.texto}
                              </span>
                            </td>
                            <td className="text-center">
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary me-1"
                                title="Editar"
                                onClick={() => abrirEditarProducto(p)}
                              >
                                <i className="bi bi-pencil-square"></i>
                              </button>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                title="Eliminar"
                                onClick={() => void handleEliminarProducto(p)}
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
            </section>
          )}

          {/* SECCION USUARIOS */}
          {seccion === 'usuarios' && (
            <section>
              <div className="card shadow-sm border-0">
                <div className="card-header navbar-custom text-white d-flex justify-content-between align-items-center py-3">
                  <h5 className="mb-0 fw-bold text-white">
                    <i className="bi bi-people-fill text-gold me-2"></i>
                    Usuarios Registrados
                  </h5>
                  <span className="badge btn-gold text-dark fw-bold">
                    {usuarios.length} registrados
                  </span>
                </div>

                <div className="card-body p-0 table-responsive bg-white">
                  <table className="table table-hover align-middle mb-0">
                    <thead>
                      <tr className="border-bottom">
                        <th className="py-3">ID</th>
                        <th className="py-3">Nombre Completo</th>
                        <th className="py-3">Correo Electrónico</th>
                        <th className="py-3">Rol</th>
                        <th className="py-3">Estado</th>
                        <th className="py-3 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loadingUsuarios && (
                        <tr>
                          <td colSpan={6} className="text-center py-4">
                            Cargando usuarios...
                          </td>
                        </tr>
                      )}
                      {usuarios.map((u) => (
                        <tr key={u.id}>
                          <td>#{String(u.id).padStart(3, '0')}</td>
                          <td className="fw-bold">{u.nombre}</td>
                          <td>{u.email}</td>
                          <td>
                            <select
                              className="form-select form-select-sm w-auto"
                              value={u.rol}
                              onChange={(e) =>
                                void handleCambiarRolUsuario(
                                  u,
                                  e.target.value as RolUsuario
                                )
                              }
                            >
                              <option value="CLIENTE">CLIENTE</option>
                              <option value="ADMIN">ADMIN</option>
                            </select>
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                u.activo ? 'bg-success' : 'bg-secondary'
                              }`}
                            >
                              {u.activo ? 'Activo' : 'Deshabilitado'}
                            </span>
                          </td>
                          <td className="text-center">
                            <button
                              type="button"
                              className={`btn btn-sm ${
                                u.activo
                                  ? 'btn-outline-danger'
                                  : 'btn-outline-success'
                              }`}
                              onClick={() => void handleToggleEstadoUsuario(u)}
                            >
                              {u.activo ? 'Deshabilitar' : 'Habilitar'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>

      {/* MODAL DETALLE PEDIDO */}
      {pedidoSeleccionado && (
        <div className="modal-react-backdrop">
          <div className="card shadow-lg w-100" style={{ maxWidth: '720px' }}>
            <div className="card-header navbar-custom text-white d-flex justify-content-between align-items-center py-3">
              <h5 className="mb-0 fw-bold">
                Detalle del Pedido #{pedidoSeleccionado.id}
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={() => setPedidoSeleccionado(null)}
              ></button>
            </div>
            <div className="card-body">
              {(() => {
                const desp = obtenerDespachoPedido(pedidoSeleccionado.id);
                const usr = mapaUsuarios.get(pedidoSeleccionado.usuarioId);
                return (
                  <div className="row mb-3 small">
                    <div className="col-md-6">
                      <h6 className="fw-bold border-bottom pb-1 text-gold">
                        Información del Cliente
                      </h6>
                      <p className="mb-1">
                        <strong>Cliente:</strong>{' '}
                        {desp?.clienteNombre ||
                          usr?.nombre ||
                          `Usuario #${pedidoSeleccionado.usuarioId}`}
                      </p>
                      <p className="mb-1">
                        <strong>Correo:</strong>{' '}
                        {desp?.clienteEmail || usr?.email || 'No informado'}
                      </p>
                      <p className="mb-1">
                        <strong>Teléfono:</strong>{' '}
                        {desp?.clienteTelefono || 'No informado'}
                      </p>
                    </div>
                    <div className="col-md-6">
                      <h6 className="fw-bold border-bottom pb-1 text-gold">
                        Dirección de Despacho
                      </h6>
                      <p className="mb-1">
                        <strong>Dirección:</strong>{' '}
                        {desp?.direccion || 'Compra registrada por sistema'}
                      </p>
                      <p className="mb-1">
                        <strong>Ubicación:</strong>{' '}
                        {desp?.comunaRegion || '-'}
                      </p>
                    </div>
                  </div>
                );
              })()}

              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label fw-bold text-gold">
                    Cambiar Estado del Pedido:
                  </label>
                  <select
                    className="form-select"
                    value={nuevoEstadoModal}
                    disabled={pedidoSeleccionado.estado !== 'PENDIENTE'}
                    onChange={(e) =>
                      setNuevoEstadoModal(e.target.value as EstadoPedido)
                    }
                  >
                    <option value="PENDIENTE">PENDIENTE</option>
                    <option value="PAGADO">PAGADO</option>
                    <option value="CANCELADO">CANCELADO</option>
                  </select>
                </div>
                <div className="col-md-6 align-self-end mt-2 mt-md-0">
                  <button
                    type="button"
                    className="btn btn-gold fw-bold w-100"
                    disabled={pedidoSeleccionado.estado !== 'PENDIENTE'}
                    onClick={() => void handleActualizarEstadoPedido()}
                  >
                    Actualizar Estado
                  </button>
                </div>
              </div>

              <h6 className="fw-bold border-bottom pb-1 text-gold">
                Ítems Comprados
              </h6>
              <div className="table-responsive">
                <table className="table table-sm table-striped">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Precio Histórico</th>
                      <th>Cantidad</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pedidoSeleccionado.items.map((item, idx) => {
                      const prod = mapaProductos.get(item.productoId);
                      return (
                        <tr key={item.id ?? idx}>
                          <td>
                            {prod?.nombre ?? `Producto #${item.productoId}`}
                          </td>
                          <td>{formatearPrecioCLP(item.precioUnitario)}</td>
                          <td>{item.cantidad}</td>
                          <td className="fw-bold">
                            {formatearPrecioCLP(
                              item.subtotal ??
                                item.cantidad * item.precioUnitario
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="text-end fw-bold fs-5 mt-2">
                Total:{' '}
                <span className="text-gold">
                  {formatearPrecioCLP(pedidoSeleccionado.total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL AGREGAR / EDITAR PRODUCTO */}
      {mostrarModalProducto && (
        <div className="modal-react-backdrop">
          <div className="card shadow-lg w-100" style={{ maxWidth: '520px' }}>
            <form onSubmit={(e) => void handleGuardarProducto(e)}>
              <div className="card-header navbar-custom text-white d-flex justify-content-between align-items-center py-3">
                <h5 className="mb-0 fw-bold">
                  {formProd.idEditar !== null
                    ? 'Editar Producto'
                    : 'Agregar Producto'}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setMostrarModalProducto(false)}
                ></button>
              </div>

              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Nombre del Producto
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={formProd.nombre}
                    onChange={(e) =>
                      setFormProd((prev) => ({
                        ...prev,
                        nombre: e.target.value
                      }))
                    }
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Categoría</label>
                  <select
                    className="form-select"
                    value={formProd.categoria}
                    onChange={(e) =>
                      setFormProd((prev) => ({
                        ...prev,
                        categoria: e.target.value as CategoriaProducto
                      }))
                    }
                    required
                  >
                    <option value="URBANO">Estilo Urbano (URBANO)</option>
                    <option value="CASUAL">Colección Casual (CASUAL)</option>
                    <option value="FORMAL">Línea Formal (FORMAL)</option>
                    <option value="DEPORTIVO">
                      Línea Deportiva (DEPORTIVO)
                    </option>
                    <option value="ACCESORIOS">Accesorios (ACCESORIOS)</option>
                  </select>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-4">
                    <label className="form-label fw-semibold">Precio ($)</label>
                    <input
                      type="number"
                      className="form-control"
                      min={1}
                      value={formProd.precio}
                      onChange={(e) =>
                        setFormProd((prev) => ({
                          ...prev,
                          precio: e.target.value
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="col-4">
                    <label className="form-label fw-semibold">Stock</label>
                    <input
                      type="number"
                      className="form-control"
                      min={0}
                      value={formProd.stock}
                      onChange={(e) =>
                        setFormProd((prev) => ({
                          ...prev,
                          stock: e.target.value
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="col-4">
                    <label className="form-label fw-semibold">Stock Mín.</label>
                    <input
                      type="number"
                      className="form-control"
                      min={0}
                      value={formProd.stockMinimo}
                      onChange={(e) =>
                        setFormProd((prev) => ({
                          ...prev,
                          stockMinimo: e.target.value
                        }))
                      }
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Ruta Imagen (opcional)
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="/img/urbana.jpg"
                    value={formProd.imagen}
                    onChange={(e) =>
                      setFormProd((prev) => ({
                        ...prev,
                        imagen: e.target.value
                      }))
                    }
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Descripción</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={formProd.descripcion}
                    onChange={(e) =>
                      setFormProd((prev) => ({
                        ...prev,
                        descripcion: e.target.value
                      }))
                    }
                    required
                  />
                </div>

                <div className="mb-2">
                  <label className="form-label fw-semibold">
                    Tallas disponibles
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="S - Small, M - Medium, L - Large"
                    value={formProd.tallas}
                    onChange={(e) =>
                      setFormProd((prev) => ({
                        ...prev,
                        tallas: e.target.value
                      }))
                    }
                  />
                  <small className="text-muted">Sepáralas con coma.</small>
                </div>
              </div>

              <div className="card-footer d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setMostrarModalProducto(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-gold fw-bold"
                  disabled={guardandoProd}
                >
                  {guardandoProd ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
