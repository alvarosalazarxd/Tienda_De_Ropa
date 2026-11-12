import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import UsuarioService, {
  guardarSesionUsuario
} from '../services/usuario.service';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verPassword, setVerPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const correoLimpio = email.trim().toLowerCase();

    if (!correoLimpio || !password) {
      setError('Ingresa tu correo y contraseña.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Consultamos al usuario por correo en el microservicio (puerto 8081)
      const usuario = await UsuarioService.obtenerPorEmail(correoLimpio);

      if (!usuario || usuario.password !== password) {
        setError('Correo o contraseña incorrectos.');
        return;
      }

      if (!usuario.activo) {
        setError(
          'Tu cuenta se encuentra deshabilitada. Contacta al administrador.'
        );
        return;
      }

      guardarSesionUsuario(usuario);

      if (usuario.rol === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/productos');
      }
    } catch (err) {
      console.error(err);
      setError(
        'No fue posible conectar con el microservicio de usuarios (puerto 8081).'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card card-custom shadow-lg border-gold rounded-3">
            <div className="card-body p-4 p-sm-5 bg-dark text-white rounded-3">
              <h2
                className="text-center fw-bold text-uppercase mb-4"
                style={{ letterSpacing: '1px' }}
              >
                Iniciar Sesión
              </h2>

              {error && <div className="alert alert-danger py-2">{error}</div>}

              <form onSubmit={(e) => void handleSubmit(e)}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Correo Electrónico
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-secondary border-secondary text-light">
                      <i className="bi bi-envelope-fill"></i>
                    </span>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      placeholder="nombre@ejemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="password" className="form-label">
                    Contraseña
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-secondary border-secondary text-light">
                      <i className="bi bi-lock-fill"></i>
                    </span>
                    <input
                      type={verPassword ? 'text' : 'password'}
                      className="form-control"
                      id="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => setVerPassword((prev) => !prev)}
                    >
                      <i
                        className={`bi ${
                          verPassword ? 'bi-eye-fill' : 'bi-eye-slash-fill'
                        } text-light`}
                      ></i>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-fashion w-100 py-2 rounded-pill fw-bold"
                  disabled={loading}
                >
                  {loading ? 'Ingresando...' : 'Ingresar'}
                </button>
              </form>

              <div className="mt-3 p-2 rounded bg-black bg-opacity-25 text-white-50 small text-center">
                Cuenta Admin de prueba: <strong>admin@modaestilo.cl</strong> /{' '}
                <strong>admin123</strong>
              </div>

              <div className="text-center mt-4">
                <p className="mb-0 text-white-50 small">
                  ¿No tienes una cuenta?{' '}
                  <Link
                    to="/registro"
                    className="text-gold text-decoration-none fw-bold hover-link"
                  >
                    Regístrate aquí
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;
