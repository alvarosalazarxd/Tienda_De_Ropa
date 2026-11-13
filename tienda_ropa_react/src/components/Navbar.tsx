import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router';
import useCarrito from '../hooks/useCarrito';
import {
  cerrarSesionUsuario,
  obtenerSesionUsuario,
  Usuario
} from '../services/usuario.service';

const Navbar = () => {
  const navigate = useNavigate();
  const { totalUnidades } = useCarrito();
  const [usuarioActivo, setUsuarioActivo] = useState<Usuario | null>(() =>
    obtenerSesionUsuario()
  );

  useEffect(() => {
    const actualizarUsuario = () => {
      setUsuarioActivo(obtenerSesionUsuario());
    };
    window.addEventListener('sesionActualizada', actualizarUsuario);
    window.addEventListener('storage', actualizarUsuario);
    return () => {
      window.removeEventListener('sesionActualizada', actualizarUsuario);
      window.removeEventListener('storage', actualizarUsuario);
    };
  }, []);

  const handleCerrarSesion = () => {
    cerrarSesionUsuario();
    navigate('/');
  };

  return (
    <>
      <div className="announcement-bar text-center d-none d-sm-block">
        <span>
          <i className="bi bi-stars text-gold me-2"></i>
          Nueva Colección 2026 · Despacho a todo Chile · Cambios sin costo
        </span>
      </div>

      <nav className="navbar navbar-expand-md navbar-dark navbar-custom sticky-top">
        <div className="container">
          <Link className="navbar-brand fw-bold text-uppercase" to="/">
            Moda <span className="text-gold">&amp;</span> Estilo
          </Link>

          <button
            className="navbar-toggler border-0"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#collapsibleNavbar"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="collapsibleNavbar">
            <ul className="navbar-nav me-auto ms-md-4">
              <li className="nav-item">
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) =>
                    `nav-link nav-link-line ${isActive ? 'active fw-semibold' : ''}`
                  }
                >
                  Inicio
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  to="/productos"
                  className={({ isActive }) =>
                    `nav-link nav-link-line ${isActive ? 'active fw-semibold' : ''}`
                  }
                >
                  Catálogo
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  to="/nosotros"
                  className={({ isActive }) =>
                    `nav-link nav-link-line ${isActive ? 'active fw-semibold' : ''}`
                  }
                >
                  Nosotros
                </NavLink>
              </li>
            </ul>

            <ul className="navbar-nav ms-auto align-items-md-center gap-md-2">
              <li className="nav-item my-1 my-md-0">
                <NavLink
                  to="/carrito"
                  className={({ isActive }) =>
                    `nav-link nav-cart-pill ${isActive ? 'active' : ''}`
                  }
                >
                  <i className="bi bi-bag fs-6"></i>
                  <span className="small fw-semibold">Bolsa</span>
                  <span
                    className="badge rounded-pill bg-warning text-dark"
                    style={{ fontSize: '0.7rem' }}
                  >
                    {totalUnidades}
                  </span>
                </NavLink>
              </li>

              {!usuarioActivo ? (
                <>
                  <li className="nav-item">
                    <NavLink
                      to="/mis-compras"
                      className={({ isActive }) =>
                        `nav-link nav-link-line ${isActive ? 'active fw-semibold' : ''}`
                      }
                    >
                      <i className="bi bi-bag-check me-1"></i>
                      Mis Compras
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink
                      to="/login"
                      className={({ isActive }) =>
                        `nav-link nav-link-line ${isActive ? 'active fw-semibold' : ''}`
                      }
                    >
                      Iniciar Sesión
                    </NavLink>
                  </li>
                  <li className="nav-item mt-2 mt-md-0">
                    <NavLink
                      to="/registro"
                      className="btn btn-gold btn-sm rounded-pill px-3"
                    >
                      Registrarse
                    </NavLink>
                  </li>
                </>
              ) : (
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle fw-semibold text-warning"
                  href="#"
                  id="userDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="bi bi-person-circle me-1"></i>
                  {usuarioActivo.nombre}
                </a>
                <ul
                  className="dropdown-menu dropdown-menu-end bg-dark border-secondary"
                  aria-labelledby="userDropdown"
                >
                  <li>
                    <Link className="dropdown-item text-light" to="/favoritos">
                      <i className="bi bi-heart-fill me-2 text-danger"></i>
                      Mis favoritos
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="dropdown-item text-light"
                      to="/mis-compras"
                    >
                      <i className="bi bi-bag-check me-2 text-gold"></i>
                      Mis Compras
                    </Link>
                  </li>
                  {usuarioActivo.rol === 'ADMIN' && (
                    <>
                      <li>
                        <hr className="dropdown-divider border-secondary" />
                      </li>
                      <li>
                        <Link className="dropdown-item text-light" to="/admin">
                          <i className="bi bi-speedometer2 me-2 text-gold"></i>
                          Panel Admin
                        </Link>
                      </li>
                    </>
                  )}
                  <li>
                    <hr className="dropdown-divider border-secondary" />
                  </li>
                  <li>
                    <button
                      type="button"
                      className="dropdown-item text-danger fw-semibold"
                      onClick={handleCerrarSesion}
                    >
                      <i className="bi bi-box-arrow-right me-2"></i>
                      Cerrar Sesión
                    </button>
                  </li>
                </ul>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
    </>
  );
};

export default Navbar;
