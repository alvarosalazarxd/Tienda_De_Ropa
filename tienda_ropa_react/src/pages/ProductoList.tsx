import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import useProductos from '../hooks/useProductos';
import useCarrito from '../hooks/useCarrito';
import {
  formatearPrecioCLP,
  obtenerImagenProducto,
  obtenerNombreCategoria,
  obtenerTallasProducto,
  Producto
} from '../services/producto.service';
import UsuarioService, {
  obtenerSesionUsuario
} from '../services/usuario.service';

const CATEGORIAS_FILTRO = [
  { valor: 'TODOS', etiqueta: 'Todas' },
  { valor: 'URBANO', etiqueta: 'Urbano' },
  { valor: 'CASUAL', etiqueta: 'Casual' },
  { valor: 'FORMAL', etiqueta: 'Formal' },
  { valor: 'DEPORTIVO', etiqueta: 'Deportivo' },
  { valor: 'ACCESORIOS', etiqueta: 'Accesorios' }
];

const ProductoList = () => {
  // Hook personalizado que consulta el microservicio de productos en Spring Boot
  const { productos, loading, error, recargar } = useProductos();
  const { agregarAlCarrito } = useCarrito();
  const [searchParams, setSearchParams] = useSearchParams();

  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>(
    () => searchParams.get('categoria')?.toUpperCase() || 'TODOS'
  );
  const [orden, setOrden] = useState('default');
  const [cantidades, setCantidades] = useState<Record<number, number>>({});
  const [favoritos, setFavoritos] = useState<number[]>([]);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [productoAgregadoId, setProductoAgregadoId] = useState<number | null>(
    null
  );

  useEffect(() => {
    const paramCat = searchParams.get('categoria')?.toUpperCase() || 'TODOS';
    setCategoriaFiltro(paramCat);
  }, [searchParams]);

  useEffect(() => {
    const cargarFavs = async () => {
      const sesion = obtenerSesionUsuario();
      if (!sesion) {
        setFavoritos([]);
        return;
      }
      try {
        const ids = await UsuarioService.obtenerFavoritos(sesion.id);
        setFavoritos(ids);
      } catch {
        setFavoritos([]);
      }
    };
    void cargarFavs();
  }, []);

  const productosFiltrados = useMemo(() => {
    let resultado = [...productos];

    if (categoriaFiltro !== 'TODOS') {
      resultado = resultado.filter((p) => p.categoria === categoriaFiltro);
    }

    if (busqueda.trim() !== '') {
      const termino = busqueda.trim().toLowerCase();
      resultado = resultado.filter(
        (p) =>
          p.nombre.toLowerCase().includes(termino) ||
          p.descripcion.toLowerCase().includes(termino) ||
          obtenerNombreCategoria(p.categoria).toLowerCase().includes(termino)
      );
    }

    switch (orden) {
      case 'nombre-asc':
        resultado.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
        break;
      case 'nombre-desc':
        resultado.sort((a, b) => b.nombre.localeCompare(a.nombre, 'es'));
        break;
      case 'precio-asc':
        resultado.sort((a, b) => a.precio - b.precio);
        break;
      case 'precio-desc':
        resultado.sort((a, b) => b.precio - a.precio);
        break;
    }

    return resultado;
  }, [productos, categoriaFiltro, busqueda, orden]);

  const obtenerCantidad = (id: number) => cantidades[id] ?? 1;

  const cambiarCantidadLocal = (
    producto: Producto,
    nuevaCantidad: number
  ) => {
    const maximo = Math.max(1, producto.stock);
    const ajustada = Math.min(maximo, Math.max(1, nuevaCantidad));
    setCantidades((prev) => ({ ...prev, [producto.id]: ajustada }));
  };

  const handleCambiarCategoria = (nuevaCategoria: string) => {
    setCategoriaFiltro(nuevaCategoria);
    if (nuevaCategoria === 'TODOS') {
      setSearchParams({});
    } else {
      setSearchParams({ categoria: nuevaCategoria });
    }
  };

  const limpiarFiltros = () => {
    setBusqueda('');
    setOrden('default');
    handleCambiarCategoria('TODOS');
  };

  const handleToggleFavorito = async (productoId: number) => {
    const sesion = obtenerSesionUsuario();
    if (!sesion) {
      setMensaje('Inicia sesión con tu cuenta para guardar productos favoritos.');
      return;
    }

    try {
      const esFav = favoritos.includes(productoId);
      const actualizados = esFav
        ? await UsuarioService.eliminarFavorito(sesion.id, productoId)
        : await UsuarioService.agregarFavorito(sesion.id, productoId);
      setFavoritos(actualizados);
    } catch {
      setMensaje('No se pudo actualizar favoritos en el microservicio de usuarios.');
    }
  };

  const handleAgregarCarrito = async (producto: Producto) => {
    const cantidad = obtenerCantidad(producto.id);
    if (producto.stock < cantidad) {
      setMensaje(`Solo quedan ${producto.stock} unidades disponibles.`);
      return;
    }

    try {
      const tallas = obtenerTallasProducto(producto);
      await agregarAlCarrito(
        producto.id,
        producto.precio,
        cantidad,
        tallas[0] ?? 'Única'
      );
      setProductoAgregadoId(producto.id);
      setMensaje(`${producto.nombre} se agregó al carrito.`);
      window.setTimeout(() => {
        setProductoAgregadoId(null);
      }, 1200);
    } catch {
      setMensaje(
        'No se pudo conectar con el servicio de carrito a través del Gateway (puerto 8080).'
      );
    }
  };

  return (
    <div>
      <header className="catalogo-header">
        <div className="container">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div>
              <span className="text-gold fw-semibold text-uppercase small">
                Moda &amp; Estilo
              </span>
              <h2 className="fw-bold text-uppercase mb-0 mt-1">
                {categoriaFiltro === 'TODOS'
                  ? 'Catálogo de Productos'
                  : `Categoría: ${obtenerNombreCategoria(categoriaFiltro)}`}
              </h2>
              <div className="catalogo-linea"></div>
              <p className="text-white-50 small mb-0">
                Prendas urbanas, casuales, deportivas, formales y accesorios de
                temporada
              </p>
            </div>

            <div className="d-flex gap-2">
              {categoriaFiltro !== 'TODOS' && (
                <button
                  type="button"
                  onClick={limpiarFiltros}
                  className="btn btn-outline-light btn-sm rounded-pill px-3"
                >
                  <i className="bi bi-grid me-1"></i>
                  Ver todos
                </button>
              )}
              <button
                type="button"
                onClick={() => void recargar()}
                disabled={loading}
                className="btn btn-gold btn-sm rounded-pill px-3"
              >
                <i className="bi bi-arrow-clockwise me-1"></i>
                {loading ? 'Actualizando...' : 'Actualizar lista'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mb-5 mt-4">
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
            No se pudo conectar con los productos a través del Gateway en{' '}
            <code>http://localhost:8080/api/productos</code>.
          </div>
        )}

        <section className="filtros-catalogo">
          <div className="row g-3 align-items-center">
            <div className="col-12 col-lg-6">
              <div className="buscador-productos">
                <i className="bi bi-search"></i>
                <input
                  type="search"
                  className="form-control"
                  placeholder="Buscar prendas, estilos o accesorios..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <select
                className="form-select"
                value={categoriaFiltro}
                onChange={(e) => handleCambiarCategoria(e.target.value)}
              >
                <option value="TODOS">Todas las categorías</option>
                <option value="URBANO">Estilo Urbano</option>
                <option value="CASUAL">Colección Casual</option>
                <option value="FORMAL">Línea Formal</option>
                <option value="DEPORTIVO">Línea Deportiva</option>
                <option value="ACCESORIOS">Accesorios</option>
              </select>
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <select
                className="form-select"
                value={orden}
                onChange={(e) => setOrden(e.target.value)}
              >
                <option value="default">Ordenar por</option>
                <option value="nombre-asc">Nombre: A → Z</option>
                <option value="nombre-desc">Nombre: Z → A</option>
                <option value="precio-asc">Precio: menor a mayor</option>
                <option value="precio-desc">Precio: mayor a menor</option>
              </select>
            </div>
          </div>

          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-3 pt-3 border-top border-light-subtle">
            <div className="d-flex flex-wrap gap-2">
              {CATEGORIAS_FILTRO.map((cat) => (
                <button
                  key={cat.valor}
                  type="button"
                  className={`chip-categoria ${
                    categoriaFiltro === cat.valor ? 'active' : ''
                  }`}
                  onClick={() => handleCambiarCategoria(cat.valor)}
                >
                  {cat.etiqueta}
                </button>
              ))}
            </div>

            <p className="text-muted small mb-0">
              Mostrando{' '}
              <strong className="text-dark">{productosFiltrados.length}</strong>{' '}
              productos
            </p>
          </div>
        </section>

        {productosFiltrados.length === 0 && !loading ? (
          <div className="text-center py-5">
            <i className="bi bi-search fs-1 text-gold-deep d-block mb-3"></i>
            <h4 className="fw-bold">No encontramos productos</h4>
            <p className="text-muted">
              Prueba con otro nombre, descripción o categoría.
            </p>
            <button
              type="button"
              className="btn btn-fashion rounded-pill px-4"
              onClick={limpiarFiltros}
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div className="row g-4">
            {productosFiltrados.map((producto) => {
              const agotado = producto.stock <= 0;
              const bajoStock = producto.stock > 0 && producto.stock <= 5;
              const esFavorito = favoritos.includes(producto.id);
              const cantidad = obtenerCantidad(producto.id);
              const recienAgregado = productoAgregadoId === producto.id;

              return (
                <div
                  key={producto.id}
                  className="col-12 col-sm-6 col-md-4 col-lg-3 d-flex"
                >
                  <div className="card producto-card shadow-sm position-relative w-100">
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

                    <button
                      type="button"
                      className="btn btn-dark btn-sm rounded-circle position-absolute top-0 end-0 m-3 shadow-sm border-0 z-1 btn-favorito"
                      onClick={() => void handleToggleFavorito(producto.id)}
                      title={
                        esFavorito
                          ? 'Quitar de favoritos'
                          : 'Agregar a favoritos'
                      }
                    >
                      <i
                        className={`bi ${
                          esFavorito
                            ? 'bi-heart-fill text-danger'
                            : 'bi-heart text-gold'
                        }`}
                      ></i>
                    </button>

                    <div className="producto-imagen-container">
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

                      <p className="text-muted small flex-grow-1 mb-2">
                        {producto.descripcion}
                      </p>

                      <small className="text-muted d-block mb-2">
                        Stock disponible:{' '}
                        <strong className="text-dark">{producto.stock}</strong>
                      </small>

                      <div className="mt-auto pt-2 border-top border-light-subtle">
                        <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
                          <span className="precio-producto">
                            {formatearPrecioCLP(producto.precio)}
                          </span>

                          <div style={{ width: '108px' }}>
                            <div className="input-group input-group-sm">
                              <button
                                type="button"
                                className="btn btn-outline-dark"
                                disabled={agotado}
                                onClick={() =>
                                  cambiarCantidadLocal(producto, cantidad - 1)
                                }
                              >
                                −
                              </button>
                              <input
                                type="number"
                                className="form-control text-center px-1"
                                min={1}
                                max={Math.max(1, producto.stock)}
                                value={cantidad}
                                disabled={agotado}
                                onChange={(e) =>
                                  cambiarCantidadLocal(
                                    producto,
                                    Number(e.target.value) || 1
                                  )
                                }
                              />
                              <button
                                type="button"
                                className="btn btn-outline-dark"
                                disabled={agotado}
                                onClick={() =>
                                  cambiarCantidadLocal(producto, cantidad + 1)
                                }
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          className={`btn btn-sm w-100 rounded-pill ${
                            recienAgregado
                              ? 'btn-success'
                              : 'btn-agregar-producto'
                          }`}
                          disabled={agotado}
                          onClick={() => void handleAgregarCarrito(producto)}
                        >
                          <i
                            className={`bi ${
                              recienAgregado
                                ? 'bi-check-circle'
                                : 'bi-bag-plus'
                            } me-1`}
                          ></i>
                          {agotado
                            ? 'Sin stock'
                            : recienAgregado
                            ? '¡Agregado!'
                            : 'Agregar al carrito'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default ProductoList;
