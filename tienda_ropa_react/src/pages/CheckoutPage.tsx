import axios from 'axios';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import useCarrito from '../hooks/useCarrito';
import useProductos from '../hooks/useProductos';
import {
  obtenerTallaItemCarrito,
  obtenerUsuarioIdCarrito
} from '../services/carrito.service';
import ProductoService, {
  formatearPrecioCLP,
  Producto
} from '../services/producto.service';
import PedidoService, {
  guardarDespachoPedido
} from '../services/pedido.service';
import UsuarioService, {
  obtenerSesionUsuario
} from '../services/usuario.service';
import {
  contarDigitosMovil,
  LONGITUD_TELEFONO_CL,
  manejarTeclaTelefono,
  MAX_DIGITOS_MOVIL_CL,
  normalizarTelefonoChileno,
  PREFIJO_TELEFONO_CL,
  validarCorreoRealActivo,
  validarFormatoCorreoReal,
  validarTelefonoChileno
} from '../utils/validaciones';

const regionesChile = [
  'Arica y Parinacota',
  'Tarapacá',
  'Antofagasta',
  'Atacama',
  'Coquimbo',
  'Valparaíso',
  'Metropolitana de Santiago',
  "Libertador General Bernardo O'Higgins",
  'Maule',
  'Ñuble',
  'Biobío',
  'La Araucanía',
  'Los Ríos',
  'Los Lagos',
  'Aysén del General Carlos Ibáñez del Campo',
  'Magallanes y de la Antártica Chilena'
];

const CheckoutPage = () => {
  const navigate = useNavigate();
  const sesion = obtenerSesionUsuario();
  const { carrito, vaciar } = useCarrito();
  const { productos } = useProductos();

  const partesNombre = (sesion?.nombre ?? '').split(' ');
  const [nombre, setNombre] = useState(partesNombre[0] ?? '');
  const [apellido, setApellido] = useState(
    partesNombre.slice(1).join(' ') ?? ''
  );
  const [correo, setCorreo] = useState(sesion?.email ?? '');
  const [telefono, setTelefono] = useState(PREFIJO_TELEFONO_CL);
  const [estadoCorreo, setEstadoCorreo] = useState<
    'verificando' | 'ok' | 'error' | 'offline' | null
  >(null);
  const [mensajeCorreo, setMensajeCorreo] = useState('');
  const [region, setRegion] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [comuna, setComuna] = useState('');
  const [calle, setCalle] = useState('');
  const [numero, setNumero] = useState('');
  const [depto, setDepto] = useState('');
  const [codigoPostal, setCodigoPostal] = useState('');
  const [referencia, setReferencia] = useState('');

  const [metodoPago, setMetodoPago] = useState<'tarjeta' | 'transferencia'>(
    'tarjeta'
  );
  const [numeroTarjeta, setNumeroTarjeta] = useState('');
  const [expiracion, setExpiracion] = useState('');
  const [cvv, setCvv] = useState('');

  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);

  const usuarioCarritoId = obtenerUsuarioIdCarrito();

  const mapaProductos = useMemo(() => {
    const mapa = new Map<number, Producto>();
    productos.forEach((p) => mapa.set(p.id, p));
    return mapa;
  }, [productos]);

  const items = carrito?.items ?? [];
  const total = carrito?.total ?? 0;

  const digitosMovil = contarDigitosMovil(telefono);
  const checkTelefono = validarTelefonoChileno(telefono);

  useEffect(() => {
    const limpio = correo.trim();
    if (!limpio) {
      setEstadoCorreo(null);
      setMensajeCorreo('');
      return;
    }

    const sintaxis = validarFormatoCorreoReal(limpio);
    if (!sintaxis.valido) {
      setEstadoCorreo('error');
      setMensajeCorreo(sintaxis.mensaje ?? 'Correo electrónico inválido.');
      return;
    }

    let cancelado = false;
    setEstadoCorreo('verificando');
    setMensajeCorreo('Verificando servidor de correo activo...');

    const timer = window.setTimeout(async () => {
      const res = await validarCorreoRealActivo(limpio);
      if (cancelado) return;

      if (!res.valido) {
        setEstadoCorreo('error');
        setMensajeCorreo(res.mensaje);
        return;
      }

      try {
        const cuenta = await UsuarioService.obtenerPorEmail(
          limpio.toLowerCase()
        );
        if (cancelado) return;
        if (cuenta && !cuenta.activo) {
          setEstadoCorreo('error');
          setMensajeCorreo(
            'La cuenta registrada con este correo está deshabilitada o inactiva.'
          );
          return;
        }
      } catch {
        // Si el microservicio no responde en la vista previa, se validará al enviar
      }

      setEstadoCorreo(res.estado);
      setMensajeCorreo(res.mensaje);
    }, 400);

    return () => {
      cancelado = true;
      window.clearTimeout(timer);
    };
  }, [correo]);

  const formatearInputTarjeta = (valor: string) => {
    const digitos = valor.replace(/\D/g, '').slice(0, 16);
    const bloques = digitos.match(/.{1,4}/g);
    setNumeroTarjeta(bloques ? bloques.join(' ') : '');
  };

  const formatearExpiracion = (valor: string) => {
    const digitos = valor.replace(/\D/g, '').slice(0, 4);
    setExpiracion(
      digitos.length >= 3
        ? `${digitos.slice(0, 2)}/${digitos.slice(2, 4)}`
        : digitos
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (items.length === 0) {
      setError('Tu carrito está vacío.');
      return;
    }

    const validacionTel = validarTelefonoChileno(telefono);
    if (!validacionTel.valido) {
      setError(
        validacionTel.mensaje ??
          'Ingresa un teléfono móvil chileno válido (+569 seguido de 8 dígitos).'
      );
      return;
    }

    if (!/^\d{7}$/.test(codigoPostal)) {
      setError('El código postal debe tener exactamente 7 dígitos.');
      return;
    }

    if (metodoPago === 'tarjeta') {
      const tarjetaSinEspacios = numeroTarjeta.replace(/\s/g, '');
      if (tarjetaSinEspacios !== '4242424242424242') {
        setError(
          'Tarjeta de demostración: usa el número de prueba 4242 4242 4242 4242.'
        );
        return;
      }
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiracion)) {
        setError('Usa el formato MM/AA para la fecha de vencimiento.');
        return;
      }
      const [mes, anio] = expiracion.split('/').map(Number);
      const fechaVenc = new Date(2000 + anio, mes, 1);
      if (fechaVenc <= new Date()) {
        setError('La tarjeta ingresada se encuentra vencida.');
        return;
      }
      if (cvv !== '123') {
        setError('El CVV de demostración es 123.');
        return;
      }
    }

    setProcesando(true);
    setError(null);
    setExito(null);

    const correoLimpio = correo.trim().toLowerCase();
    const validacionCorreo = await validarCorreoRealActivo(correoLimpio);
    if (!validacionCorreo.valido) {
      setEstadoCorreo('error');
      setMensajeCorreo(validacionCorreo.mensaje);
      setError(validacionCorreo.mensaje);
      setProcesando(false);
      return;
    }

    try {
      const cuentaAsociada = await UsuarioService.obtenerPorEmail(correoLimpio);
      if (cuentaAsociada && !cuentaAsociada.activo) {
        const msgInactiva =
          'La cuenta asociada a este correo está inactiva o deshabilitada. Usa un correo activo.';
        setEstadoCorreo('error');
        setMensajeCorreo(msgInactiva);
        setError(msgInactiva);
        setProcesando(false);
        return;
      }
    } catch {
      // Si el servicio de usuarios no está disponible, se continúa si el correo tiene dominio real activo
    }

    // Guardamos que productos descontamos por si ocurre un error a mitad de camino
    const descontados: { productoId: number; cantidad: number }[] = [];

    try {
      // 1. Descontamos el stock en el microservicio de productos (puerto 8085)
      for (const item of items) {
        await ProductoService.descontarStock(item.productoId, item.cantidad);
        descontados.push({
          productoId: item.productoId,
          cantidad: item.cantidad
        });
      }

      // 2. Registramos el pedido en el microservicio de pedidos (puerto 8083)
      const usuarioPedidoId = sesion?.id ?? usuarioCarritoId;
      const nuevoPedido = await PedidoService.crear({
        usuarioId: usuarioPedidoId,
        items: items.map((item) => ({
          productoId: item.productoId,
          cantidad: item.cantidad,
          precioUnitario: item.precioUnitario
        }))
      });

      // 3. Si pago con tarjeta lo dejamos altiro como PAGADO; transferencia queda PENDIENTE
      if (metodoPago === 'tarjeta') {
        await PedidoService.cambiarEstado(nuevoPedido.id, 'PAGADO');
      }

      // Guardamos los datos del despacho para verlos en Mis Compras y en el Panel Admin
      const tallasMapa: Record<string, string> = {};
      items.forEach((i) => {
        tallasMapa[String(i.productoId)] = obtenerTallaItemCarrito(
          usuarioCarritoId,
          i.productoId
        );
      });

      const dirFormateada = `${calle} #${numero}${
        depto ? `, Depto/Casa: ${depto}` : ''
      }${referencia ? ` (Ref: ${referencia})` : ''}`;

      guardarDespachoPedido(nuevoPedido.id, {
        clienteNombre: `${nombre} ${apellido}`.trim(),
        clienteEmail: correo.trim(),
        clienteTelefono: telefono.trim(),
        direccion: dirFormateada,
        comunaRegion: `${comuna}, ${ciudad}, ${region} (CP: ${codigoPostal})`,
        metodoPago:
          metodoPago === 'tarjeta'
            ? 'Tarjeta de Crédito/Débito'
            : 'Transferencia Bancaria',
        tallasPorProducto: tallasMapa
      });

      // 4. Vaciamos el carrito en el microservicio de carrito (puerto 8084)
      await vaciar();

      setExito(
        `¡Compra realizada con éxito! Tu pedido #${nuevoPedido.id} fue registrado.`
      );

      window.setTimeout(() => {
        navigate(sesion ? '/mis-compras' : '/');
      }, 1400);
    } catch (err) {
      console.error(err);
      // Si fallo la creacion del pedido devolvemos el stock que alcanzamos a descontar
      for (const mov of descontados) {
        try {
          await ProductoService.aumentarStock(mov.productoId, mov.cantidad);
        } catch {
          // ignorar error secundario
        }
      }
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 409) {
          setError('No hay suficiente stock disponible para completar la compra.');
        } else if (!err.response) {
          setError(
            'No se pudo conectar con los microservicios a través del Gateway (revisa que Gateway 8080, Productos 8085, Pedidos 8083 y Carrito 8084 estén encendidos).'
          );
        } else {
          setError(
            `Error del servidor (${err.response.status}) al procesar la compra. Revisa el stock y la conexión a MySQL.`
          );
        }
      } else {
        setError(
          'No se pudo completar la compra. Revisa el stock disponible y que los microservicios estén activos.'
        );
      }
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="container my-4">
      <Link
        to="/carrito"
        className="text-decoration-none text-secondary d-inline-block mb-3 fw-semibold"
      >
        <i className="bi bi-arrow-left me-1"></i>
        Volver al carrito
      </Link>

      <h1 className="h2 fw-bold mb-3">Finalizar compra</h1>

      <div className="alert alert-info border-0 shadow-sm mb-4">
        <i className="bi bi-info-circle-fill me-2"></i>
        Compra de demostración conectada a los microservicios. Para probar
        tarjeta: <strong>4242 4242 4242 4242</strong>, vencimiento{' '}
        <strong>12/99</strong> y CVV <strong>123</strong>.
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {exito && <div className="alert alert-success">{exito}</div>}

      <div className="row g-4">
        <div className="col-lg-8">
          <form onSubmit={(e) => void handleSubmit(e)}>
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body p-4">
                <h2 className="h4 card-title fw-bold mb-2">
                  1. Datos de despacho
                </h2>
                <p className="text-muted small mb-4">
                  Todos los campos son obligatorios salvo los indicados como
                  opcionales.
                </p>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-medium">Nombre</label>
                    <input
                      type="text"
                      className="form-control"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-medium">Apellido</label>
                    <input
                      type="text"
                      className="form-control"
                      value={apellido}
                      onChange={(e) => setApellido(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-medium">
                      Correo electrónico (real y activo)
                    </label>
                    <input
                      type="email"
                      className={`form-control${
                        estadoCorreo === 'error'
                          ? ' is-invalid'
                          : estadoCorreo === 'ok'
                            ? ' is-valid'
                            : ''
                      }`}
                      placeholder="nombre@gmail.com"
                      maxLength={150}
                      value={correo}
                      onChange={(e) => setCorreo(e.target.value)}
                      required
                    />
                    {estadoCorreo && (
                      <div
                        className={`form-text ${
                          estadoCorreo === 'error'
                            ? 'text-danger fw-medium'
                            : estadoCorreo === 'ok'
                              ? 'text-success fw-medium'
                              : 'text-muted'
                        }`}
                      >
                        {mensajeCorreo}
                      </div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-medium">
                      Teléfono (+569 + 8 dígitos)
                    </label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      className={`form-control${
                        digitosMovil === MAX_DIGITOS_MOVIL_CL &&
                        !checkTelefono.valido
                          ? ' is-invalid'
                          : checkTelefono.valido
                            ? ' is-valid'
                            : ''
                      }`}
                      placeholder="+56912345678"
                      maxLength={LONGITUD_TELEFONO_CL}
                      value={telefono}
                      onChange={(e) =>
                        setTelefono(normalizarTelefonoChileno(e.target.value))
                      }
                      onKeyDown={(e) =>
                        manejarTeclaTelefono(e, telefono, setTelefono)
                      }
                      onFocus={(e) => {
                        const pos = e.currentTarget.selectionStart ?? 0;
                        if (pos < PREFIJO_TELEFONO_CL.length) {
                          e.currentTarget.setSelectionRange(
                            PREFIJO_TELEFONO_CL.length,
                            PREFIJO_TELEFONO_CL.length
                          );
                        }
                      }}
                      required
                    />
                    <div
                      className={`form-text ${
                        checkTelefono.valido
                          ? 'text-success fw-medium'
                          : digitosMovil === MAX_DIGITOS_MOVIL_CL
                            ? 'text-danger fw-medium'
                            : 'text-muted'
                      }`}
                    >
                      {checkTelefono.valido
                        ? `✓ ${digitosMovil}/${MAX_DIGITOS_MOVIL_CL} dígitos válidos después de +569`
                        : digitosMovil === MAX_DIGITOS_MOVIL_CL &&
                            checkTelefono.mensaje
                          ? checkTelefono.mensaje
                          : `${digitosMovil}/${MAX_DIGITOS_MOVIL_CL} dígitos después de +569`}
                    </div>
                  </div>

                  <div className="col-12">
                    <label className="form-label fw-medium">Región</label>
                    <select
                      className="form-select"
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      required
                    >
                      <option value="">Selecciona una región</option>
                      {regionesChile.map((reg) => (
                        <option key={reg} value={reg}>
                          {reg}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-medium">
                      Ciudad o localidad
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ej.: Concepción"
                      value={ciudad}
                      onChange={(e) => setCiudad(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-medium">Comuna</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Escribe tu comuna"
                      value={comuna}
                      onChange={(e) => setComuna(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-md-8">
                    <label className="form-label fw-medium">
                      Calle, avenida o camino
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ej.: Avenida O'Higgins"
                      value={calle}
                      onChange={(e) => setCalle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label fw-medium">
                      Número de domicilio
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ej.: 123"
                      value={numero}
                      onChange={(e) => setNumero(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-medium">
                      Depto / Casa (opcional)
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ej.: Depto. 402"
                      value={depto}
                      onChange={(e) => setDepto(e.target.value)}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-medium">
                      Código postal (7 dígitos)
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="4030000"
                      maxLength={7}
                      value={codigoPostal}
                      onChange={(e) =>
                        setCodigoPostal(
                          e.target.value.replace(/\D/g, '').slice(0, 7)
                        )
                      }
                      required
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label fw-medium">
                      Referencia de entrega (opcional)
                    </label>
                    <textarea
                      className="form-control"
                      rows={2}
                      placeholder="Ej.: Entrada por el pasaje lateral"
                      value={referencia}
                      onChange={(e) => setReferencia(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body p-4">
                <h2 className="h4 card-title fw-bold mb-3">
                  2. Método de pago
                </h2>

                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="radio"
                    id="pagoTarjeta"
                    checked={metodoPago === 'tarjeta'}
                    onChange={() => setMetodoPago('tarjeta')}
                  />
                  <label
                    className="form-check-label fw-semibold"
                    htmlFor="pagoTarjeta"
                  >
                    Tarjeta de prueba (queda Pagado de inmediato)
                  </label>
                </div>

                {metodoPago === 'tarjeta' && (
                  <div className="p-3 bg-light rounded mb-3 border">
                    <div className="row g-3">
                      <div className="col-12">
                        <label className="form-label fw-medium">
                          Número de tarjeta de prueba
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="4242 4242 4242 4242"
                          maxLength={19}
                          value={numeroTarjeta}
                          onChange={(e) => formatearInputTarjeta(e.target.value)}
                          required
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-medium">
                          Vencimiento
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="MM/AA"
                          maxLength={5}
                          value={expiracion}
                          onChange={(e) => formatearExpiracion(e.target.value)}
                          required
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-medium">
                          CVV de prueba
                        </label>
                        <input
                          type="password"
                          className="form-control"
                          placeholder="123"
                          maxLength={3}
                          value={cvv}
                          onChange={(e) =>
                            setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))
                          }
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    id="pagoTransferencia"
                    checked={metodoPago === 'transferencia'}
                    onChange={() => setMetodoPago('transferencia')}
                  />
                  <label
                    className="form-check-label fw-semibold"
                    htmlFor="pagoTransferencia"
                  >
                    Transferencia bancaria (queda Pendiente de confirmación)
                  </label>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-dark btn-lg w-100 fw-bold shadow-sm py-3"
              disabled={procesando || items.length === 0}
            >
              {procesando ? 'Procesando pedido...' : 'Confirmar compra'}
            </button>
          </form>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <h2 className="h4 card-title fw-bold mb-3">Resumen de compra</h2>

              {items.length === 0 ? (
                <p className="text-muted small">
                  No hay productos en el pedido.
                </p>
              ) : (
                items.map((item) => {
                  const prod = mapaProductos.get(item.productoId);
                  const nombreProd =
                    prod?.nombre ?? `Producto #${item.productoId}`;
                  const talla = obtenerTallaItemCarrito(
                    usuarioCarritoId,
                    item.productoId
                  );
                  return (
                    <div
                      key={item.id}
                      className="d-flex justify-content-between align-items-center mb-2 small"
                    >
                      <div>
                        <span className="fw-bold">{nombreProd}</span>
                        <span className="text-muted"> ({talla})</span>
                        <span className="text-muted"> x{item.cantidad}</span>
                      </div>
                      <span className="fw-semibold">
                        {formatearPrecioCLP(item.subtotal)}
                      </span>
                    </div>
                  );
                })
              )}

              <hr />

              <div className="d-flex justify-content-between align-items-center fw-bold fs-4 my-2">
                <span>Total</span>
                <span className="text-gold">{formatearPrecioCLP(total)}</span>
              </div>

              <p className="text-muted small mb-0 text-center mt-3">
                <i className="bi bi-truck me-1"></i>
                Envío gratuito en esta demostración.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
