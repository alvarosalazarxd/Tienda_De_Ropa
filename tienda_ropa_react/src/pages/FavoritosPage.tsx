import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import useProductos from '../hooks/useProductos';
import {
  formatearPrecioCLP,
  obtenerImagenProducto,
  obtenerNombreCategoria
} from '../services/producto.service';
import UsuarioService, {
  obtenerSesionUsuario
} from '../services/usuario.service';

const FavoritosPage = () => {
  const sesion = obtenerSesionUsuario();
  const { productos, loading: loadingProductos } = useProductos();
  const [favoritosIds, setFavoritosIds] = useState<number[]>([]);
  const [loadingFavs, setLoadingFavs] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarFavoritos = async () => {
      if (!sesion) return;
      setLoadingFavs(true);
      setError(null);
      try {
        const ids = await UsuarioService.obtenerFavoritos(sesion.id);
        setFavoritosIds(ids);
      } catch (err) {
        console.error(err);
        setError('No se pudieron cargar tus favoritos desde el servidor.');
      } finally {
        setLoadingFavs(false);
      }
    };

    void cargarFavoritos();
  }, [sesion?.id]);

  const handleQuitarFavorito = async (productoId: number) => {
    if (!sesion) return;
    try {
      const actualizados = await UsuarioService.eliminarFavorito(
        sesion.id,
        productoId
      );
      setFavoritosIds(actualizados);
    } catch {
      setError('No fue posible quitar el producto de favoritos.');
    }
  };

  if (!sesion) {
    return (
      <main className="container py-5">
        <div className="alert alert-info">
          Inicia sesión para consultar tus favoritos.{' '}
          <Link to="/login" className="alert-link">
            Iniciar sesión
          </Link>
        </div>
      </main>
    );
  }

  const productosFavoritos = productos.filter((p) =>
    favoritosIds.includes(p.id)
  );
  const cargando = loadingProductos || loadingFavs;

  return (
    <main className="container py-5">
      <h1 className="h2 fw-bold mb-2">Mis favoritos</h1>
      <p className="text-muted mb-4">
        Tus productos guardados en tu cuenta para revisar después.
      </p>

      {error && <div className="alert alert-danger">{error}</div>}
      {cargando && <p>Cargando favoritos...</p>}

      {!cargando && productosFavoritos.length === 0 ? (
        <div className="alert alert-light border text-center py-4">
          No tienes productos favoritos guardados todavía.{' '}
          <Link to="/productos" className="fw-semibold">
            Explorar productos
          </Link>
        </div>
      ) : (
        <div className="row g-4">
          {productosFavoritos.map((producto) => {
            const agotado = producto.stock <= 0;
            return (
              <div key={producto.id} className="col-12 col-sm-6 col-lg-3">
                <article className="card h-100 shadow-sm border-0">
                  <img
                    src={obtenerImagenProducto(producto)}
                    alt={producto.nombre}
                    className="card-img-top"
                    style={{ height: '230px', objectFit: 'cover' }}
                  />
                  <div className="card-body d-flex flex-column">
                    <h2 className="h6 fw-bold">{producto.nombre}</h2>
                    <p className="text-muted small">
                      {obtenerNombreCategoria(producto.categoria)}
                    </p>
                    <p className="fw-bold text-gold">
                      {formatearPrecioCLP(producto.precio)}
                    </p>
                    {agotado && (
                      <span className="badge bg-danger align-self-start mb-3">
                        Sin stock
                      </span>
                    )}
                    <div className="mt-auto d-grid gap-2">
                      {agotado ? (
                        <button
                          type="button"
                          className="btn btn-secondary"
                          disabled
                        >
                          Sin stock disponible
                        </button>
                      ) : (
                        <Link
                          to={`/productos/${producto.id}`}
                          className="btn btn-dark"
                        >
                          Ver producto y elegir talla
                        </Link>
                      )}
                      <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={() => void handleQuitarFavorito(producto.id)}
                      >
                        <i className="bi bi-heart-fill me-1"></i>
                        Quitar de favoritos
                      </button>
                    </div>
                  </div>
                </article>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
};

export default FavoritosPage;
