import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import UsuarioService from '../services/usuario.service';

const RegistroPage = () => {
  const navigate = useNavigate();
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [usuarioCorreo, setUsuarioCorreo] = useState('');
  const [dominio, setDominio] = useState('@gmail.com');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verPass, setVerPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setExito(null);

    const nombreCompleto = `${nombres.trim()} ${apellidos.trim()}`.trim();
    const parteCorreo = usuarioCorreo.trim().toLowerCase();
    const emailFinal =
      dominio && !parteCorreo.includes('@')
        ? `${parteCorreo}${dominio}`
        : parteCorreo;

    if (
      !nombres.trim() ||
      !apellidos.trim() ||
      !emailFinal ||
      !password ||
      !confirmPassword
    ) {
      setError('Por favor completa todos los campos.');
      return;
    }

    if (!emailFinal.includes('@')) {
      setError('Ingresa un correo electrónico válido.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      // Revisamos primero si el correo ya esta registrado en MySQL
      const existente = await UsuarioService.obtenerPorEmail(emailFinal);
      if (existente) {
        setError('El correo electrónico ya se encuentra registrado.');
        setLoading(false);
        return;
      }

      await UsuarioService.crear({
        nombre: nombreCompleto,
        email: emailFinal,
        password
      });

      setExito('¡Cuenta creada con éxito! Redirigiendo al inicio de sesión...');
      window.setTimeout(() => {
        navigate('/login');
      }, 1200);
    } catch (err) {
      console.error(err);
      setError(
        'Ocurrió un error al registrar el usuario. Verifica que el microservicio de usuarios esté corriendo.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-7">
          <div className="card card-custom shadow-lg border-gold rounded-3">
            <div className="card-body p-4 p-sm-5 bg-dark text-white rounded-3">
              <h2
                className="text-center fw-bold text-uppercase mb-4"
                style={{ letterSpacing: '1px' }}
              >
                Crear Cuenta
              </h2>

              {error && <div className="alert alert-danger">{error}</div>}
              {exito && <div className="alert alert-success">{exito}</div>}

              <form onSubmit={(e) => void handleSubmit(e)}>
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Nombres</label>
                    <div className="input-group">
                      <span className="input-group-text bg-secondary border-secondary text-light">
                        <i className="bi bi-person-fill"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Juan Antonio"
                        value={nombres}
                        onChange={(e) => setNombres(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Apellidos</label>
                    <div className="input-group">
                      <span className="input-group-text bg-secondary border-secondary text-light">
                        <i className="bi bi-person-fill"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="González Soto"
                        value={apellidos}
                        onChange={(e) => setApellidos(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Correo electrónico</label>
                  <div className="input-group">
                    <span className="input-group-text bg-secondary border-secondary text-light">
                      <i className="bi bi-envelope-fill"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder={
                        dominio ? 'Ej.: nicolas' : 'correo@dominio.cl'
                      }
                      value={usuarioCorreo}
                      onChange={(e) => setUsuarioCorreo(e.target.value)}
                      required
                    />
                    <select
                      className="form-select"
                      value={dominio}
                      onChange={(e) => setDominio(e.target.value)}
                    >
                      <option value="@gmail.com">@gmail.com</option>
                      <option value="@gmail.cl">@gmail.cl</option>
                      <option value="@hotmail.com">@hotmail.com</option>
                      <option value="@outlook.com">@outlook.com</option>
                      <option value="@icloud.com">@icloud.com</option>
                      <option value="">Otro</option>
                    </select>
                  </div>
                  <small className="text-white-50">
                    Escribe tu usuario y elige el dominio, o elige “Otro” para
                    escribir el correo completo.
                  </small>
                </div>

                <div className="mb-3">
                  <label className="form-label">Contraseña</label>
                  <div className="input-group">
                    <span className="input-group-text bg-secondary border-secondary text-light">
                      <i className="bi bi-lock-fill"></i>
                    </span>
                    <input
                      type={verPass ? 'text' : 'password'}
                      className="form-control"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setVerPass((prev) => !prev)}
                    >
                      <i
                        className={`bi ${
                          verPass ? 'bi-eye-fill' : 'bi-eye-slash-fill'
                        } text-light`}
                      ></i>
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label">Confirmar Contraseña</label>
                  <div className="input-group">
                    <span className="input-group-text bg-secondary border-secondary text-light">
                      <i className="bi bi-shield-lock-fill"></i>
                    </span>
                    <input
                      type={verPass ? 'text' : 'password'}
                      className="form-control"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-fashion w-100 py-2 rounded-pill fw-bold"
                  disabled={loading}
                >
                  {loading ? 'Guardando...' : 'Registrarse'}
                </button>
              </form>

              <div className="text-center mt-4">
                <p className="mb-0 text-white-50 small">
                  ¿Ya tienes una cuenta?{' '}
                  <Link
                    to="/login"
                    className="text-gold text-decoration-none fw-bold hover-link"
                  >
                    Inicia sesión aquí
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

export default RegistroPage;
