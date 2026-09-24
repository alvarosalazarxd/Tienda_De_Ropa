function escaparHTML(str) {
    if (str === null || str === undefined) return '';

    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function parsearPrecio(precioRaw) {
    if (typeof precioRaw === 'number') {
        return Math.max(0, Math.floor(precioRaw));
    }

    if (!precioRaw) return 0;

    const digitos = String(precioRaw).replace(/\D/g, '');
    return parseInt(digitos, 10) || 0;
}

document.addEventListener('DOMContentLoaded', () => {
    actualizarNavbarUsuario();
    vincularBotonesAgregarCarrito();
    renderizarCarrito();
    actualizarContadorCarrito();
    vincularBotonVaciar();
    vincularBotonPagar();
    renderizarCatalogoProductos();
    inicializarPanelAdminProductos();
    cargarTablaUsuarios();
    configurarEventosTablaUsuarios();
    inicializarCheckout();
    inicializarGraficoVentas();
    prepararAyudasFormulario();

    document.querySelectorAll('.btn-toggle-password').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();

            const inputGroup = btn.closest('.input-group');
            const input = inputGroup
                ? inputGroup.querySelector('input')
                : null;

            const icon = btn.querySelector('i');

            if (input) {
                const esPassword = input.type === 'password';
                input.type = esPassword ? 'text' : 'password';

                if (icon) {
                    icon.classList.toggle('bi-eye-slash-fill', !esPassword);
                    icon.classList.toggle('bi-eye-fill', esPassword);
                }
            }
        });
    });

    const formRegistro = document.getElementById('formRegistro');

    if (formRegistro) {
        formRegistro.addEventListener('submit', (e) => {
            e.preventDefault();

            const nombres =
                document.getElementById('regNombres')?.value.trim() || '';

            const apellidos =
                document.getElementById('regApellidos')?.value.trim() || '';

            const email =
                document.getElementById('regEmail')?.value.trim().toLowerCase() || '';

            const password =
                document.getElementById('regPassword')?.value || '';

            const confirmPassword =
                document.getElementById('confirmPassword')?.value || '';

            const alerta = document.getElementById('alertaRegistro');

            const mostrarAlerta = (msg, tipo = 'danger') => {
                if (alerta) {
                    alerta.className = `alert alert-${tipo} mb-4`;
                    alerta.textContent = msg;
                    alerta.classList.remove('d-none');
                } else {
                    mostrarAviso('Registro', msg);
                }
            };

            if (!nombres || !apellidos || !email || !password || !confirmPassword) {
                mostrarAlerta('Por favor completa todos los campos.');
                return;
            }

            if (password !== confirmPassword) {
                mostrarAlerta('Las contraseñas no coinciden.');
                return;
            }

            let usuarios = [];

            try {
                usuarios =
                    JSON.parse(localStorage.getItem('usuarios_registrados')) || [];
            } catch (err) {
                usuarios = [];
            }

            if (usuarios.some(u => u.email === email)) {
                mostrarAlerta('El correo electrónico ya se encuentra registrado.');
                return;
            }

            usuarios.push({
                id: Date.now(),
                nombres,
                apellidos,
                email,
                password,
                rol: 'Cliente'
            });

            localStorage.setItem(
                'usuarios_registrados',
                JSON.stringify(usuarios)
            );

            mostrarAlerta(
                '¡Cuenta creada con éxito! Redirigiendo...',
                'success'
            );

            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        });
    }

    const formLogin = document.getElementById('formLogin');

    if (formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email =
                document.getElementById('email')?.value.trim().toLowerCase() || '';

            const password =
                document.getElementById('password')?.value || '';

            if (email === 'admin@modaestilo.cl' && password === 'admin123') {
                const adminUser = {
                    nombres: 'Administrador',
                    apellidos: '',
                    email: email,
                    rol: 'Administrador'
                };

                localStorage.setItem(
                    'usuario_activo',
                    JSON.stringify(adminUser)
                );

                await mostrarAviso(
                    'Inicio de sesión',
                    '¡Bienvenido Administrador!'
                );

                window.location.href = 'admin.html';
                return;
            }

            let usuarios = [];

            try {
                usuarios =
                    JSON.parse(localStorage.getItem('usuarios_registrados')) || [];
            } catch (err) {
                usuarios = [];
            }

            const user = usuarios.find(
                u => u.email === email && u.password === password
            );

            if (user) {
                localStorage.setItem(
                    'usuario_activo',
                    JSON.stringify(user)
                );

                await mostrarAviso(
                    'Inicio de sesión',
                    `¡Bienvenido de nuevo, ${user.nombres}!`
                );

                window.location.href = 'productos.html';
            } else {
                await mostrarAviso(
                    'No se pudo iniciar sesión',
                    'Correo o contraseña incorrectos.'
                );
            }
        });
    }
});

const CARRITO_KEY = 'carrito_moda_estilo';
const VENTAS_KEY = 'ventas_moda_estilo';

function obtenerCarrito() {
    try {
        const data =
            localStorage.getItem(CARRITO_KEY) ||
            localStorage.getItem('carritoCompras');

        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error('Error al leer el carrito desde localStorage:', e);
        return [];
    }
}

function guardarCarrito(carrito) {
    localStorage.setItem(CARRITO_KEY, JSON.stringify(carrito));
    localStorage.removeItem('carritoCompras');
    actualizarContadorCarrito();
}

function actualizarContadorCarrito() {
    const carrito = obtenerCarrito();

    const totalItems = carrito.reduce(
        (sum, item) => sum + (parseInt(item.cantidad, 10) || 0),
        0
    );

    document.querySelectorAll(
        '#contadorCarrito, .contador-carrito'
    ).forEach(span => {
        span.textContent = totalItems;
    });
}

function vincularBotonesAgregarCarrito() {
    document.addEventListener('click', (e) => {
        const btn = e.target.closest(
            '.btn-agregar-carrito, [data-agregar-carrito]'
        );

        if (!btn) return;

        const textoBoton = btn.textContent.trim().toLowerCase();

        if (
            textoBoton.includes('ver') ||
            textoBoton.includes('detalle') ||
            textoBoton.includes('comprando') ||
            textoBoton.includes('pagar') ||
            textoBoton.includes('vaciar') ||
            textoBoton.includes('confirmar')
        ) {
            return;
        }

        e.preventDefault();

        let id = btn.getAttribute('data-id') || btn.dataset.id;
        let nombre = btn.dataset.nombre || btn.getAttribute('data-nombre');
        let precio = btn.dataset.precio || btn.getAttribute('data-precio');
        let imagen = btn.dataset.imagen || btn.getAttribute('data-imagen');
        let talla = btn.dataset.talla || btn.getAttribute('data-talla') || '';

        const tarjeta =
            btn.closest('.card') ||
            btn.closest('.tarjeta-producto') ||
            btn.closest('.col') ||
            btn.closest('.producto-item');

        if (tarjeta) {
            if (!nombre) {
                const nombreElem = tarjeta.querySelector(
                    '.card-title, h5, h6, .titulo-producto, .nombre-producto'
                );

                nombre = nombreElem
                    ? nombreElem.textContent.trim()
                    : 'Producto';
            }

            if (!precio) {
                const tarjetaClon = tarjeta.cloneNode(true);

                tarjetaClon.querySelectorAll(
                    'del, s, .text-decoration-line-through, .precio-anterior, .text-muted'
                ).forEach(el => el.remove());

                const precioElem = tarjetaClon.querySelector(
                    '.text-gold, .fw-bold, .precio, .card-text, .price'
                ) || tarjetaClon;

                precio = precioElem ? precioElem.textContent : '0';
            }

            if (!imagen) {
                const imgElem = tarjeta.querySelector('img');

                imagen = imgElem
                    ? (imgElem.getAttribute('src') || imgElem.src)
                    : 'img/urbana.jpg';
            }

            if (!talla) {
                const selectTalla = tarjeta.querySelector('select');
                talla = selectTalla ? selectTalla.value : '';
            }
        }

        const precioNumero = parsearPrecio(precio);

        agregarAlCarrito(nombre, precioNumero, imagen, talla, id);

        mostrarAviso(
            'Producto agregado',
            nombre + ' se agregó al carrito.'
        );

        const textoOriginal = btn.innerHTML;

        btn.innerHTML =
            '<i class="bi bi-check-circle me-1"></i> ¡Agregado!';

        btn.classList.add('btn-success');

        setTimeout(() => {
            btn.innerHTML = textoOriginal;
            btn.classList.remove('btn-success');
        }, 1200);
    });
}

function agregarAlCarrito(
    nombre,
    precio,
    imagen = '',
    talla = '',
    id = null
) {
    const nombreLimpio =
        typeof nombre === 'string' && !nombre.includes('[object')
            ? nombre.trim()
            : 'Producto';

    const precioLimpio = parsearPrecio(precio);

    const imagenLimpia =
        typeof imagen === 'string' && !imagen.includes('[object')
            ? imagen
            : 'img/urbana.jpg';

    const tallaLimpia =
        typeof talla === 'string' ? talla.trim() : '';

    let carrito = obtenerCarrito();

    const indice = carrito.findIndex(item =>
        (id && item.id == id) ||
        (item.nombre === nombreLimpio && item.talla === tallaLimpia)
    );

    if (indice !== -1) {
        carrito[indice].cantidad =
            (parseInt(carrito[indice].cantidad, 10) || 0) + 1;

        if (precioLimpio > 0) {
            carrito[indice].precio = precioLimpio;
        }
    } else {
        carrito.push({
            id: id ? parseInt(id, 10) : Date.now(),
            nombre: nombreLimpio,
            precio: precioLimpio,
            imagen: imagenLimpia,
            talla: tallaLimpia,
            cantidad: 1
        });
    }

    guardarCarrito(carrito);
    renderizarCarrito();
}

window.eliminarDelCarrito = function(index) {
    let carrito = obtenerCarrito();

    if (index >= 0 && index < carrito.length) {
        carrito.splice(index, 1);
        guardarCarrito(carrito);
        renderizarCarrito();
    }
};

function renderizarCarrito() {
    const contenedor = document.getElementById('listaCarrito');
    const carritoVacioMsg = document.getElementById('carritoVacioMsg');
    const contenidoCarrito = document.getElementById('contenidoCarrito');

    if (!contenedor) return;

    const carrito = obtenerCarrito();

    const formatoCLP = new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP'
    });

    const resetTotales = () => {
        document.querySelectorAll(
            '#subtotalCarrito, #totalCarrito, .subtotal-carrito, .total-carrito'
        ).forEach(el => {
            if (el) el.textContent = '$0';
        });
    };

    if (carrito.length === 0) {
        contenedor.innerHTML = '';

        if (carritoVacioMsg) {
            carritoVacioMsg.classList.remove('d-none');
        }

        if (contenidoCarrito) {
            contenidoCarrito.classList.add('d-none');
        }

        resetTotales();
        return;
    }

    if (carritoVacioMsg) {
        carritoVacioMsg.classList.add('d-none');
    }

    if (contenidoCarrito) {
        contenidoCarrito.classList.remove('d-none');
    }

    let total = 0;
    contenedor.innerHTML = '';

    carrito.forEach((item, index) => {
        const cantidad = parseInt(item.cantidad, 10) || 1;
        const precio = parsearPrecio(item.precio);
        const subtotal = precio * cantidad;

        total += subtotal;

        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td>
                <div class="d-flex align-items-center">
                    <img
                        src="${escaparHTML(item.imagen || 'img/urbana.jpg')}"
                        alt="${escaparHTML(item.nombre)}"
                        class="img-fluid rounded me-3"
                        style="width: 50px; height: 50px; object-fit: cover;"
                    >
                    <div>
                        <h6 class="mb-0 fw-bold">
                            ${escaparHTML(item.nombre)}
                        </h6>
                        <small class="text-muted">
                            Talla: ${escaparHTML(item.talla || 'Única')}
                        </small>
                    </div>
                </div>
            </td>
            <td>${formatoCLP.format(precio)}</td>
            <td>
                <input
                    type="number"
                    class="form-control form-control-sm cantidad-item"
                    data-index="${index}"
                    value="${cantidad}"
                    min="1"
                    max="10"
                    style="width: 70px;"
                >
            </td>
            <td class="fw-bold">${formatoCLP.format(subtotal)}</td>
            <td class="text-end">
                <button
                    type="button"
                    class="btn btn-sm btn-outline-danger btn-eliminar"
                    data-index="${index}"
                    title="Eliminar producto"
                >
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;

        contenedor.appendChild(tr);
    });

    const totalFormateado = formatoCLP.format(total);

    document.querySelectorAll(
        '#subtotalCarrito, #totalCarrito, .subtotal-carrito, .total-carrito'
    ).forEach(elem => {
        elem.textContent = totalFormateado;
    });

    contenedor.querySelectorAll('.cantidad-item').forEach(input => {
        input.addEventListener('change', (e) => {
            const idx = parseInt(
                e.target.getAttribute('data-index'),
                10
            );

            const nuevaCant = parseInt(e.target.value, 10);
            let cart = obtenerCarrito();

            if (nuevaCant >= 1 && cart[idx]) {
                cart[idx].cantidad = nuevaCant;
                guardarCarrito(cart);
                renderizarCarrito();
            }
        });
    });

    contenedor.querySelectorAll('.btn-eliminar').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(
                e.currentTarget.getAttribute('data-index'),
                10
            );

            window.eliminarDelCarrito(idx);
        });
    });
}

function vincularBotonVaciar() {
    const btnVaciar = document.getElementById('btnVaciarCarrito');

    if (btnVaciar) {
        btnVaciar.onclick = async () => {
            const carrito = obtenerCarrito();

            if (carrito.length === 0) return;

            const confirmado = await pedirConfirmacion(
                'Vaciar carrito',
                '¿Quieres quitar todos los productos del carrito?'
            );

            if (confirmado) {
                if (
                    JSON.stringify(obtenerCarrito()) !==
                    JSON.stringify(carrito)
                ) {
                    await mostrarAviso(
                        'El carrito cambió',
                        'Revisa los productos antes de volver a vaciarlo.'
                    );
                    return;
                }

                localStorage.removeItem(CARRITO_KEY);
                localStorage.removeItem('carritoCompras');

                renderizarCarrito();
                actualizarContadorCarrito();
            }
        };
    }
}

function vincularBotonPagar() {
    const btnPagar = document.getElementById('btnPagar');

    if (btnPagar) {
        btnPagar.onclick = () => {
            const carrito = obtenerCarrito();

            if (carrito.length === 0) {
                mostrarAviso(
                    'Carrito vacío',
                    'Agrega productos antes de proceder al pago.'
                );
                return;
            }

            window.location.href = 'checkout.html';
        };
    }
}

function inicializarCheckout() {
    const itemsContainer = document.getElementById('itemsCheckout');
    const totalPagoElem = document.getElementById('totalPago');
    const formCheckout = document.getElementById('formCheckout');
    const radioTarjeta = document.getElementById('tarjeta');
    const radioTransferencia = document.getElementById('transferencia');
    const camposTarjeta = document.getElementById('camposTarjeta');

    if (!itemsContainer && !formCheckout) return;

    if (
        formCheckout &&
        formCheckout.dataset.inicializado === 'si'
    ) {
        return;
    }

    if (formCheckout) {
        formCheckout.dataset.inicializado = 'si';
    }

    const inputNumero = document.getElementById('numeroTarjeta');
    const inputExp = document.getElementById('expiracionTarjeta');
    const inputCvv = document.getElementById('cvvTarjeta');

    if (inputNumero) {
        inputNumero.addEventListener('input', (e) => {
            let valor = e.target.value
                .replace(/\D/g, '')
                .substring(0, 16);

            let bloques = valor.match(/.{1,4}/g);

            e.target.value = bloques ? bloques.join(' ') : '';
        });
    }

    if (inputExp) {
        inputExp.addEventListener('input', (e) => {
            let valor = e.target.value
                .replace(/\D/g, '')
                .substring(0, 4);

            if (valor.length >= 3) {
                e.target.value =
                    valor.substring(0, 2) + '/' + valor.substring(2, 4);
            } else {
                e.target.value = valor;
            }
        });
    }

    if (inputCvv) {
        inputCvv.addEventListener('input', (e) => {
            e.target.value = e.target.value
                .replace(/\D/g, '')
                .substring(0, 3);
        });
    }

    if (radioTarjeta && radioTransferencia && camposTarjeta) {
        const inputsTarjeta = camposTarjeta.querySelectorAll('input');

        function toggleTarjeta() {
            if (radioTarjeta.checked) {
                camposTarjeta.style.display = 'block';
                inputsTarjeta.forEach(i => i.required = true);
            } else {
                camposTarjeta.style.display = 'none';
                inputsTarjeta.forEach(i => i.required = false);
            }
        }

        radioTarjeta.addEventListener('change', toggleTarjeta);
        radioTransferencia.addEventListener('change', toggleTarjeta);
    }

    const carrito = obtenerCarrito();

    const formatoCLP = new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP'
    });

    if (carrito.length === 0) {
        if (itemsContainer) {
            itemsContainer.innerHTML =
                '<p class="text-muted small">No hay productos en el pedido.</p>';
        }

        if (totalPagoElem) {
            totalPagoElem.textContent = '$0';
        }
    } else {
        let totalCalculado = 0;
        let htmlItems = '';

        carrito.forEach(item => {
            const precioNum = parsearPrecio(item.precio);
            const cantidad = parseInt(item.cantidad, 10) || 1;
            const subtotal = precioNum * cantidad;

            totalCalculado += subtotal;

            htmlItems += `
                <div class="d-flex justify-content-between align-items-center mb-2 small">
                    <div>
                        <span class="fw-bold">
                            ${escaparHTML(item.nombre)}
                        </span>
                        <span class="text-muted"> x${cantidad}</span>
                    </div>
                    <span class="fw-semibold">
                        ${formatoCLP.format(subtotal)}
                    </span>
                </div>
            `;
        });

        if (itemsContainer) {
            itemsContainer.innerHTML = htmlItems;
        }

        if (totalPagoElem) {
            totalPagoElem.textContent = formatoCLP.format(totalCalculado);
        }
    }

    if (formCheckout) {
        let procesando = false;

        formCheckout.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (procesando) return;

            const boton = formCheckout.querySelector(
                'button[type="submit"]'
            );

            procesando = true;
            boton.disabled = true;

            try {
                const telefono =
                    document.getElementById('telefonoCheckout');

                if (
                    telefono &&
                    !/^\+?\d{8,15}$/.test(telefono.value)
                ) {
                    await mostrarAviso(
                        'Revisa el teléfono',
                        'Escribe de 8 a 15 números, con un + opcional al inicio.'
                    );
                    return;
                }

                const carritoActual = obtenerCarrito();

                if (!carritoActual.length) {
                    await mostrarAviso(
                        'Carrito vacío',
                        'No hay productos en el pedido.'
                    );
                    return;
                }

                if (radioTarjeta && radioTarjeta.checked) {
                    const numero = inputNumero.value.replace(/\s/g, '');
                    const exp = inputExp.value.trim();

                    if (numero !== '4242424242424242') {
                        await mostrarAviso(
                            'Tarjeta de demostración',
                            'Usa solamente el número de prueba 4242 4242 4242 4242. No ingreses datos bancarios reales.'
                        );
                        return;
                    }

                    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(exp)) {
                        await mostrarAviso(
                            'Vencimiento inválido',
                            'Usa el formato MM/AA con un mes entre 01 y 12.'
                        );
                        return;
                    }

                    const partes = exp.split('/');

                    const fechaLimite = new Date(
                        2000 + Number(partes[1]),
                        Number(partes[0]),
                        1
                    );

                    if (fechaLimite <= new Date()) {
                        await mostrarAviso(
                            'Tarjeta vencida',
                            'Usa una fecha futura de prueba, por ejemplo 12/99.'
                        );
                        return;
                    }

                    if (inputCvv.value !== '123') {
                        await mostrarAviso(
                            'CVV de demostración',
                            'El CVV de prueba es 123.'
                        );
                        return;
                    }
                }

                // Guardamos una copia para detectar cambios durante el modal.
                const firmaCarrito = JSON.stringify(carritoActual);
                const firmaProductos = JSON.stringify(obtenerProductos());

                const firmaFormulario = JSON.stringify(
                    Array.from(
                        formCheckout.querySelectorAll('input, select, textarea')
                    ).map(i => [i.value, i.checked])
                );

                const confirmado = await pedirConfirmacion(
                    'Confirmar compra simulada',
                    'Total: ' + totalPagoElem.textContent +
                    '. Esta demostración no realiza cobros. ¿Quieres continuar?'
                );

                if (!confirmado) return;

                const formularioActual = JSON.stringify(
                    Array.from(
                        formCheckout.querySelectorAll('input, select, textarea')
                    ).map(i => [i.value, i.checked])
                );

                if (
                    JSON.stringify(obtenerCarrito()) !== firmaCarrito ||
                    JSON.stringify(obtenerProductos()) !== firmaProductos ||
                    formularioActual !== firmaFormulario
                ) {
                    await mostrarAviso(
                        'La compra cambió',
                        'Cambió el carrito, un producto o el formulario. Recarga y revisa el resumen antes de confirmar.'
                    );
                    return;
                }

                const productosDB = obtenerProductos();
                let montoTotalVenta = 0;

                // Suma las cantidades del mismo producto en todo el carrito.
                const cantidades = new Map();

                carritoActual.forEach(item => {
                    if (
                        !Number.isSafeInteger(Number(item.cantidad)) ||
                        Number(item.cantidad) <= 0
                    ) {
                        throw new Error(
                            'Revisa las cantidades del carrito.'
                        );
                    }

                    const id = String(item.id);

                    cantidades.set(
                        id,
                        (cantidades.get(id) || 0) + Number(item.cantidad)
                    );
                });

                // Comprueba existencia y stock antes de descontar.
                cantidades.forEach((cantidad, id) => {
                    const p = productosDB.find(
                        p => String(p.id) === id
                    );

                    if (
                        !p ||
                        p.activo === false ||
                        !Number.isSafeInteger(p.stock) ||
                        cantidad > p.stock
                    ) {
                        throw new Error(
                            'Un producto ya no está disponible en la cantidad solicitada. Vuelve al carrito.'
                        );
                    }
                });

                carritoActual.forEach(item => {
                    const p = productosDB.find(
                        p => String(p.id) === String(item.id)
                    );

                    if (Number(item.precio) !== Number(p.precio)) {
                        throw new Error(
                            'Cambió el precio de un producto. Elimínalo del carrito y vuelve a agregarlo para revisar el precio actual.'
                        );
                    }

                    montoTotalVenta +=
                        Number(p.precio) * Number(item.cantidad);
                });

                cantidades.forEach((cantidad, id) => {
                    productosDB.find(
                        p => String(p.id) === id
                    ).stock -= cantidad;
                });

                guardarProductos(productosDB);
                registrarVentaHistorial(montoTotalVenta);

                localStorage.removeItem(CARRITO_KEY);
                localStorage.removeItem('carritoCompras');

                await mostrarAviso(
                    'Compra simulada completada',
                    'Se registró la venta de demostración. No se ha efectuado ningún cobro real.'
                );

                location.href = 'index.html';
            } catch (error) {
                await mostrarAviso(
                    'No se pudo completar',
                    error.message
                );
            } finally {
                procesando = false;
                boton.disabled = false;
            }
        });
    }
}

function registrarVentaHistorial(monto) {
    try {
        let ventas =
            JSON.parse(localStorage.getItem(VENTAS_KEY)) || [];

        ventas.push({
            monto: monto,
            fecha: new Date().toISOString()
        });

        localStorage.setItem(VENTAS_KEY, JSON.stringify(ventas));
    } catch (e) {
        console.error('Error guardando la venta:', e);
    }
}

function obtenerVentasHistorial() {
    try {
        return JSON.parse(localStorage.getItem(VENTAS_KEY)) || [];
    } catch (e) {
        return [];
    }
}

function inicializarGraficoVentas() {
    const canvas = document.getElementById('graficoVentas');

    if (!canvas || typeof Chart === 'undefined') return;

    const ctx = canvas.getContext('2d');
    const ventas = obtenerVentasHistorial();

    const totalVentasRegistradas = ventas.reduce(
        (acc, v) => acc + (v.monto || 0),
        0
    );

    const montoBaseMes = 1450000;
    const totalMesActual = montoBaseMes + totalVentasRegistradas;

    const dashVentasMes = document.getElementById('dashVentasMes');

    if (dashVentasMes) {
        dashVentasMes.textContent =
            `$${totalMesActual.toLocaleString('es-CL')}`;
    }

    const ventasBaseSemanal = [
        150000, 220000, 180000, 290000, 240000, 310000, 260000
    ];

    if (ventas.length > 0) {
        ventasBaseSemanal[6] += totalVentasRegistradas;
    }

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
            datasets: [{
                label: 'Ventas ($)',
                data: ventasBaseSemanal,
                borderColor: '#c5a059',
                backgroundColor: 'rgba(197, 160, 89, 0.15)',
                borderWidth: 2,
                fill: true,
                tension: 0.35,
                pointBackgroundColor: '#c5a059',
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return '$' +
                                context.parsed.y.toLocaleString('es-CL');
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + (value / 1000) + 'k';
                        }
                    }
                }
            }
        }
    });
}

function actualizarNavbarUsuario() {
    let usuarioActivo = null;

    try {
        usuarioActivo =
            JSON.parse(localStorage.getItem('usuario_activo'));
    } catch (e) {
        usuarioActivo = null;
    }

    const navDerecho = document.querySelector('.navbar-nav.ms-auto');

    if (!navDerecho) return;

    if (usuarioActivo) {
        navDerecho.querySelectorAll('li').forEach(li => {
            const a = li.querySelector('a');

            if (
                a &&
                (
                    a.getAttribute('href') === 'login.html' ||
                    a.getAttribute('href') === 'registro.html'
                )
            ) {
                li.remove();
            }
        });

        const liUsuario = document.createElement('li');
        liUsuario.className = 'nav-item dropdown';

        liUsuario.innerHTML = `
            <a
                class="nav-link dropdown-toggle fw-semibold text-warning"
                href="#"
                id="userDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
            >
                <i class="bi bi-person-circle me-1"></i>
                ${escaparHTML(usuarioActivo.nombres)}
                ${escaparHTML(usuarioActivo.apellidos || '')}
            </a>
            <ul
                class="dropdown-menu dropdown-menu-end bg-dark border-secondary"
                aria-labelledby="userDropdown"
            >
                ${
                    usuarioActivo.rol === 'Administrador'
                    ? '<li><a class="dropdown-item text-light" href="admin.html"><i class="bi bi-speedometer2 me-2"></i>Panel Admin</a></li><li><hr class="dropdown-divider border-secondary"></li>'
                    : ''
                }
                <li>
                    <a
                        class="dropdown-item text-danger fw-semibold"
                        href="#"
                        id="btnCerrarSesion"
                    >
                        <i class="bi bi-box-arrow-right me-2"></i>
                        Cerrar Sesión
                    </a>
                </li>
            </ul>
        `;

        navDerecho.appendChild(liUsuario);

        const btnLogout = liUsuario.querySelector('#btnCerrarSesion');

        if (btnLogout) {
            btnLogout.addEventListener('click', cerrarSesion);
        }
    }
}

async function cerrarSesion(e) {
    if (e) e.preventDefault();

    localStorage.removeItem('usuario_activo');

    await mostrarAviso(
        'Sesión cerrada',
        'Has cerrado sesión correctamente.'
    );

    window.location.href = 'index.html';
}

const PRODUCTOS_KEY = 'productos_moda_estilo';

const productosPorDefecto = [
    {
        id: 1,
        nombre: "Polera Oversize Negra",
        categoria: "Ropa Urbana",
        categoriaSlug: "urbano",
        precio: 19990,
        img: "img/urbana.jpg",
        desc: "Polera de algodón 100% con estilo urbano holgado, ideal para un look cómodo y moderno.",
        tallas: [
            "S - Small",
            "M - Medium",
            "L - Large",
            "XL - Extra Large"
        ],
        stock: 15
    },
    {
        id: 2,
        nombre: "Pantalón Jean Classic",
        categoria: "Ropa Casual",
        categoriaSlug: "casual",
        precio: 29990,
        img: "img/casual.jpg",
        desc: "Jeans de corte recto con material resistente y flexible, perfecto para combinar a diario.",
        tallas: ["38 - S", "40 - M", "42 - L", "44 - XL"],
        stock: 8
    },
    {
        id: 3,
        nombre: "Chaqueta Formal Fit",
        categoria: "Ropa Formal",
        categoriaSlug: "formal",
        precio: 45990,
        img: "img/formal.jpg",
        desc: "Chaqueta de diseño elegante para eventos especiales, confeccionada con terminaciones finas.",
        tallas: ["S - Small", "M - Medium", "L - Large"],
        stock: 10
    },
    {
        id: 4,
        nombre: "Gorro Beanie Urbano",
        categoria: "Accesorios",
        categoriaSlug: "accesorios",
        precio: 8990,
        img: "img/accesorios.jpg",
        desc: "Gorro tejido de lana acrílica, el accesorio perfecto para complementar tu vestimenta.",
        tallas: ["Talla Única (Estandard)"],
        stock: 20
    }
];

function inicializarProductos() {
    if (!localStorage.getItem(PRODUCTOS_KEY)) {
        localStorage.setItem(
            PRODUCTOS_KEY,
            JSON.stringify(productosPorDefecto)
        );
    }
}

function obtenerProductos() {
    inicializarProductos();

    try {
        return JSON.parse(localStorage.getItem(PRODUCTOS_KEY)) || [];
    } catch (e) {
        return [];
    }
}

function guardarProductos(lista) {
    localStorage.setItem(PRODUCTOS_KEY, JSON.stringify(lista));
}

function obtenerProductoPorId(id) {
    return obtenerProductos().find(
        p => String(p.id) === String(id)
    );
}

function agregarProducto(producto) {
    const productos = obtenerProductos();
    productos.push(producto);
    guardarProductos(productos);
}

function actualizarProducto(productoActualizado) {
    const productos = obtenerProductos();

    const index = productos.findIndex(
        p => String(p.id) === String(productoActualizado.id)
    );

    if (index === -1) {
        throw new Error(
            'El producto ya no existe. Recarga el listado.'
        );
    }

    if (index !== -1) {
        productos[index] = {
            ...productos[index],
            ...productoActualizado
        };

        guardarProductos(productos);
    }
}

function eliminarProducto(id) {
    const productos = obtenerProductos().filter(
        p => String(p.id) !== String(id)
    );

    guardarProductos(productos);
}

function calcularEstadoStock(stock) {
    if (stock === 0) {
        return {
            texto: 'Agotado',
            clase: 'bg-danger'
        };
    }

    if (stock <= 5) {
        return {
            texto: 'Poco Stock',
            clase: 'bg-warning text-dark'
        };
    }

    return {
        texto: 'Disponible',
        clase: 'bg-success'
    };
}

function renderizarCatalogoProductos() {
    const catalogo = document.getElementById('contenedorProductos');

    if (!catalogo) return;

    const productos = obtenerProductos();

    const formatoCLP = new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP'
    });

    catalogo.innerHTML = '';

    productos.forEach(p => {
        const opcionesTallas = (p.tallas || ['Única'])
            .map(t => `
                <option value="${escaparHTML(t)}">
                    ${escaparHTML(t)}
                </option>
            `)
            .join('');

        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-3 mb-4';

        col.innerHTML = `
            <div class="card h-100 border-0 shadow-sm tarjeta-producto">
                <img
                    src="${escaparHTML(p.img)}"
                    class="card-img-top"
                    alt="${escaparHTML(p.nombre)}"
                    style="height: 250px; object-fit: cover;"
                >
                <div class="card-body d-flex flex-column">
                    <span class="badge bg-secondary mb-2 align-self-start">
                        ${escaparHTML(p.categoria)}
                    </span>

                    <h5 class="card-title fw-bold">
                        ${escaparHTML(p.nombre)}
                    </h5>

                    <p class="card-text text-muted small flex-grow-1">
                        ${escaparHTML(p.desc || '')}
                    </p>

                    <div class="mb-3">
                        <label class="form-label small text-muted">
                            Talla:
                        </label>
                        <select class="form-select form-select-sm">
                            ${opcionesTallas}
                        </select>
                    </div>

                    <div class="d-flex justify-content-between align-items-center mt-auto">
                        <span class="fs-5 fw-bold text-dark">
                            ${formatoCLP.format(p.precio)}
                        </span>
                        <button
                            class="btn btn-dark btn-sm btn-agregar-carrito"
                            data-id="${p.id}"
                            data-nombre="${escaparHTML(p.nombre)}"
                            data-precio="${p.precio}"
                            data-imagen="${escaparHTML(p.img)}"
                        >
                            <i class="bi bi-cart-plus me-1"></i>
                            Agregar
                        </button>
                    </div>
                </div>
            </div>
        `;

        catalogo.appendChild(col);
    });
}

function inicializarPanelAdminProductos() {
    const tbody = document.getElementById('tablaAdminProductos');

    if (!tbody) return;

    const modalEl = document.getElementById('modalProducto');

    const modalProducto = modalEl
        ? new bootstrap.Modal(modalEl)
        : null;

    const form = document.getElementById('formProductoAdmin');
    const tituloModal = document.getElementById('modalProductoTitulo');
    const inputIdEditar = document.getElementById('filaIndexEditar');

    const mapaCategoriaSlug = {
        'Ropa Urbana': 'urbano',
        'Ropa Casual': 'casual',
        'Ropa Formal': 'formal',
        'Accesorios': 'accesorios'
    };

    function renderTablaAdmin() {
        const productos = obtenerProductos();
        tbody.innerHTML = '';

        let totalStock = 0;
        let alertas = 0;

        productos.forEach(p => {
            totalStock += p.stock;

            const estado = calcularEstadoStock(p.stock);

            if (p.stock <= 5) alertas++;

            const fila = document.createElement('tr');

            fila.innerHTML = `
                <td>#${String(p.id).padStart(3, '0')}</td>
                <td class="fw-bold">${escaparHTML(p.nombre)}</td>
                <td>${escaparHTML(p.categoria)}</td>
                <td>$${p.precio.toLocaleString('es-CL')}</td>
                <td>${p.stock} unidades</td>
                <td>
                    <span class="badge ${estado.clase}">
                        ${estado.texto}
                    </span>
                </td>
                <td class="text-center">
                    <button
                        type="button"
                        class="btn btn-sm btn-outline-secondary me-1 btn-editar-producto"
                        data-id="${p.id}"
                        title="Editar"
                    >
                        <i class="bi bi-pencil-square"></i>
                    </button>
                    <button
                        type="button"
                        class="btn btn-sm btn-outline-danger btn-eliminar-producto"
                        data-id="${p.id}"
                        title="Eliminar"
                    >
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;

            tbody.appendChild(fila);
        });

        const dashStock = document.getElementById('dashTotalStock');
        const dashAlertas = document.getElementById('dashAlertas');

        if (dashStock) {
            dashStock.textContent = `${totalStock} prendas`;
        }

        if (dashAlertas) {
            dashAlertas.textContent = `${alertas} ítems bajos`;
        }
    }

    function prepararOpciones(p) {
        dibujarOpciones(
            'opcionesTallas',
            TALLAS_ADMIN,
            p ? p.tallas || [] : [],
            'talla-opcion',
            claveTalla
        );

        dibujarOpciones(
            'opcionesColores',
            COLORES_ADMIN,
            p ? p.colores || (p.color ? [p.color] : []) : [],
            'color-opcion',
            claveOpcion
        );
    }

    function abrirModalAgregar() {
        form.reset();

        inputIdEditar.value = '';
        form.dataset.original = '';

        document.getElementById('errorProducto').hidden = true;

        prepararOpciones(null);
        tituloModal.textContent = 'Agregar Producto';

        if (modalProducto) {
            modalProducto.show();
        }
    }

    function abrirModalEditar(id) {
        const p = obtenerProductoPorId(id);

        if (!p) return;

        form.reset();
        form.dataset.original = JSON.stringify(p);

        inputIdEditar.value = p.id;

        document.getElementById('errorProducto').hidden = true;
        document.getElementById('prodNombre').value = p.nombre;

        const etiqueta = categoriaParaFormulario(
            p,
            mapaCategoriaSlug
        );

        const selector = document.getElementById('prodCategoria');

        if (
            !Array.from(selector.options).some(
                o => o.value === etiqueta
            )
        ) {
            selector.add(new Option(etiqueta, etiqueta));
        }

        selector.value = etiqueta;

        document.getElementById('prodPrecio').value = p.precio;
        document.getElementById('prodStock').value = p.stock;

        document.getElementById('prodImagen').value =
            p.img || p.imagen || '';

        document.getElementById('prodDescripcion').value =
            p.desc || p.descripcion || '';

        prepararOpciones(p);
        tituloModal.textContent = 'Editar Producto';

        if (modalProducto) {
            modalProducto.show();
        }
    }

    const btnAbrir = document.getElementById('btnAbrirModalAgregar');

    if (btnAbrir) {
        btnAbrir.addEventListener('click', abrirModalAgregar);
    }

    tbody.addEventListener('click', async (e) => {
        const editar = e.target.closest('.btn-editar-producto');
        const eliminar = e.target.closest('.btn-eliminar-producto');

        if (editar) {
            abrirModalEditar(editar.dataset.id);
        }

        if (eliminar) {
            const p = obtenerProductoPorId(eliminar.dataset.id);

            if (!p) return;

            const confirmado = await pedirConfirmacion(
                'Eliminar producto',
                '¿Eliminar "' + p.nombre +
                '" del catálogo? Si permanece en un carrito, la compra se bloqueará al confirmar.'
            );

            if (confirmado) {
                if (
                    JSON.stringify(obtenerProductoPorId(p.id)) !==
                    JSON.stringify(p)
                ) {
                    await mostrarAviso(
                        'El producto cambió',
                        'Revisa el producto antes de eliminarlo.'
                    );

                    renderTablaAdmin();
                    return;
                }

                eliminarProducto(p.id);
                renderTablaAdmin();
            }
        }
    });

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const error = document.getElementById('errorProducto');
            error.hidden = true;

            try {
                if (!form.reportValidity()) return;

                const id = inputIdEditar.value;
                const existente = id ? obtenerProductoPorId(id) : null;

                if (
                    id &&
                    (
                        !existente ||
                        JSON.stringify(existente) !== form.dataset.original
                    )
                ) {
                    throw new Error(
                        'Este producto cambió. Cierra y vuelve a abrir el editor antes de guardar.'
                    );
                }

                const nombre =
                    document.getElementById('prodNombre').value.trim();

                const precio = Number(
                    document.getElementById('prodPrecio').value
                );

                const stock = Number(
                    document.getElementById('prodStock').value
                );

                const tallas = Array.from(
                    document.querySelectorAll('.talla-opcion:checked')
                ).map(e => e.value);

                const colores = Array.from(
                    document.querySelectorAll('.color-opcion:checked')
                ).map(e => e.value);

                if (!nombre) {
                    throw new Error('Escribe el nombre del producto.');
                }

                if (!Number.isSafeInteger(precio) || precio <= 0) {
                    throw new Error(
                        'El precio debe ser un número entero mayor que cero.'
                    );
                }

                if (!Number.isSafeInteger(stock) || stock < 0) {
                    throw new Error(
                        'El stock debe ser un número entero desde cero.'
                    );
                }

                if (!tallas.length) {
                    throw new Error('Selecciona al menos una talla.');
                }

                const categoria =
                    document.getElementById('prodCategoria').value;

                const producto = {
                    ...(existente || {}),
                    id: existente ? existente.id : Date.now(),
                    nombre,
                    categoria,
                    categoriaSlug:
                        mapaCategoriaSlug[categoria] ||
                        (existente && existente.categoriaSlug) ||
                        'urbano',
                    precio,
                    stock,
                    img:
                        document.getElementById('prodImagen').value.trim() ||
                        'img/urbana.jpg',
                    desc:
                        document.getElementById('prodDescripcion').value.trim(),
                    tallas,
                    colores
                };

                if (existente) {
                    actualizarProducto(producto);
                } else {
                    agregarProducto(producto);
                }

                if (modalProducto) {
                    modalProducto.hide();
                }

                renderTablaAdmin();
            } catch (e) {
                error.textContent = e.message;
                error.hidden = false;
            }
        });
    }

    renderTablaAdmin();
}

function cargarTablaUsuarios() {
    const tablaUsuarios =
        document.getElementById('tablaAdminUsuarios');

    const badgeTotal = document.getElementById('totalUsuariosBadge');

    if (!tablaUsuarios) return;

    const usuariosPorDefecto = [
        {
            id: 101,
            nombres: "Juan",
            apellidos: "Pérez",
            email: "admin@modaestilo.cl",
            rol: "Administrador"
        },
        {
            id: 102,
            nombres: "María",
            apellidos: "González",
            email: "maria.g@email.com",
            rol: "Cliente"
        },
        {
            id: 103,
            nombres: "Carlos",
            apellidos: "Silva",
            email: "carlos.silva@email.com",
            rol: "Cliente"
        }
    ];

    let usuarios = [];

    try {
        usuarios =
            JSON.parse(localStorage.getItem('usuarios_registrados'));
    } catch (e) {
        usuarios = null;
    }

    if (!usuarios || usuarios.length === 0) {
        usuarios = usuariosPorDefecto;

        localStorage.setItem(
            'usuarios_registrados',
            JSON.stringify(usuarios)
        );
    }

    if (badgeTotal) {
        badgeTotal.textContent = `${usuarios.length} registrados`;
    }

    tablaUsuarios.innerHTML = '';

    usuarios.forEach((u, index) => {
        const esAdmin =
            u.rol === 'Administrador' ||
            u.email === 'admin@modaestilo.cl';

        const badgeRol = esAdmin
            ? '<span class="badge bg-dark">Administrador</span>'
            : '<span class="badge bg-secondary">Cliente</span>';

        const nombreCompleto =
            `${u.nombres || ''} ${u.apellidos || ''}`.trim() ||
            'Usuario Desconocido';

        const fila = document.createElement('tr');

        fila.innerHTML = `
            <td>#${String(u.id || index + 1).slice(-3)}</td>
            <td class="fw-bold">${escaparHTML(nombreCompleto)}</td>
            <td>${escaparHTML(u.email)}</td>
            <td>${badgeRol}</td>
            <td class="text-center">
                <button
                    type="button"
                    class="btn btn-sm btn-outline-danger btn-eliminar-usuario"
                    data-index="${index}"
                    title="Eliminar Usuario"
                >
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;

        tablaUsuarios.appendChild(fila);
    });
}

function configurarEventosTablaUsuarios() {
    const tablaUsuarios =
        document.getElementById('tablaAdminUsuarios');

    if (!tablaUsuarios) return;

    tablaUsuarios.onclick = (e) => {
        const btnEliminar = e.target.closest('.btn-eliminar-usuario');

        if (btnEliminar) {
            const index = parseInt(btnEliminar.dataset.index, 10);
            eliminarUsuario(index);
        }
    };
}

async function eliminarUsuario(index) {
    let usuarios = [];

    try {
        usuarios =
            JSON.parse(localStorage.getItem('usuarios_registrados')) || [];
    } catch (e) {
        usuarios = [];
    }

    const user = usuarios[index];

    const nombre = user
        ? `${user.nombres} ${user.apellidos}`.trim()
        : 'este usuario';

    const confirmado = await pedirConfirmacion(
        'Eliminar usuario',
        `¿Estás seguro de que deseas eliminar a ${nombre}?`
    );

    if (confirmado) {
        const usuariosActuales =
            JSON.parse(localStorage.getItem('usuarios_registrados')) || [];

        if (
            JSON.stringify(usuariosActuales) !==
            JSON.stringify(usuarios)
        ) {
            await mostrarAviso(
                'La lista cambió',
                'Revisa los usuarios antes de eliminar.'
            );

            cargarTablaUsuarios();
            return;
        }

        usuarios.splice(index, 1);

        localStorage.setItem(
            'usuarios_registrados',
            JSON.stringify(usuarios)
        );

        cargarTablaUsuarios();
    }
}

// Modal reutilizable para mensajes y confirmaciones.
let modalEnUso = false;

function abrirDialogo(opciones) {
    if (modalEnUso) {
        return Promise.resolve(false);
    }

    modalEnUso = true;

    const anterior = document.activeElement;
    const dialogo = document.createElement('dialog');

    dialogo.id = 'modalAccion';
    dialogo.setAttribute('aria-labelledby', 'tituloAccion');

    dialogo.style.cssText = `
        width: min(480px, 90vw);
        box-sizing: border-box;
        border: 0;
        border-radius: 14px;
        padding: 24px;
        color: #222;
        background: white;
        box-shadow: 0 12px 60px #0005;
        font: 16px Arial, sans-serif;
        max-height: 85vh;
        overflow: auto;
    `;

    dialogo.innerHTML = `
        <h2
            id="tituloAccion"
            style="font-size:22px; margin:0 0 16px;"
        ></h2>

        <div
            id="contenidoAccion"
            style="line-height:1.5;"
        ></div>

        <p
            id="errorAccion"
            role="alert"
            style="color:#a00000;"
            hidden
        ></p>

        <div
            style="
                display:flex;
                gap:12px;
                justify-content:flex-end;
                margin-top:24px;
            "
        >
            <button id="cancelarAccion" type="button">
                Cancelar
            </button>

            <button id="aceptarAccion" type="button">
                Aceptar
            </button>
        </div>
    `;

    dialogo.querySelector('#tituloAccion').textContent =
        opciones.titulo;

    dialogo.querySelector('#contenidoAccion').innerHTML =
        opciones.html;

    const aceptar = dialogo.querySelector('#aceptarAccion');
    const cancelar = dialogo.querySelector('#cancelarAccion');

    aceptar.textContent = opciones.aceptar || 'Aceptar';
    cancelar.textContent = opciones.cancelar || 'Cancelar';
    cancelar.hidden = opciones.soloAceptar === true;

    [aceptar, cancelar].forEach(boton => {
        boton.style.cssText = `
            padding: 10px 18px;
            border: 1px solid #222;
            border-radius: 8px;
            cursor: pointer;
            font: inherit;
            background: white;
            color: #222;
        `;
    });

    aceptar.style.background = '#222';
    aceptar.style.color = 'white';

    document.body.appendChild(dialogo);

    return new Promise(resolve => {
        let aceptado = false;

        aceptar.addEventListener('click', () => {
            const error = opciones.validar
                ? opciones.validar()
                : '';

            if (error) {
                const caja = dialogo.querySelector('#errorAccion');

                caja.textContent = error;
                caja.hidden = false;
                return;
            }

            aceptado = true;
            dialogo.close();
        });

        cancelar.addEventListener('click', () => {
            dialogo.close();
        });

        dialogo.addEventListener('close', () => {
            dialogo.remove();
            modalEnUso = false;

            if (
                anterior &&
                anterior.isConnected &&
                !anterior.disabled
            ) {
                anterior.focus();
            }

            resolve(aceptado);
        }, { once: true });

        dialogo.showModal();
        aceptar.focus();
    });
}

function modalConfirmar(titulo, texto, aceptar) {
    return abrirDialogo({
        titulo,
        html: '<p>' + escaparHTML(texto) + '</p>',
        aceptar
    });
}

function modalInformativo(titulo, texto) {
    return abrirDialogo({
        titulo,
        html: '<p>' + escaparHTML(texto) + '</p>',
        aceptar: 'Entendido',
        soloAceptar: true
    });
}

function mostrarAviso(titulo, texto) {
    return modalInformativo(titulo, texto);
}

function pedirConfirmacion(titulo, texto) {
    return modalConfirmar(titulo, texto, 'Confirmar');
}

// Opciones controladas del formulario de productos.
const TALLAS_ADMIN = [
    'XS', 'S', 'M', 'L', 'XL', 'XXL',
    '36', '38', '40', '42', '44', '46', 'Única'
];

const COLORES_ADMIN = [
    'Negro', 'Blanco', 'Azul', 'Rojo',
    'Verde', 'Gris', 'Beige', 'Marrón',
    'Rosado', 'Amarillo', 'Morado', 'Naranja'
];

function claveOpcion(texto) {
    return String(texto || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toLowerCase();
}

function claveTalla(texto) {
    const valor = claveOpcion(texto);

    return valor.includes('unica')
        ? 'unica'
        : valor.split(' - ')[0];
}

function dibujarOpciones(
    id,
    opciones,
    guardadas,
    clase,
    normalizar
) {
    const contenedor = document.getElementById(id);
    contenedor.innerHTML = '';

    const vistos = new Set();

    // Conserva también las opciones personalizadas antiguas.
    opciones.concat(guardadas).forEach(function(opcion) {
        const clave = normalizar(opcion);

        if (vistos.has(clave)) return;
        vistos.add(clave);

        const original = guardadas.find(
            g => normalizar(g) === clave
        );

        const etiqueta = document.createElement('label');

        etiqueta.className =
            'form-check d-flex gap-2 align-items-center';

        const input = document.createElement('input');
        input.type = 'checkbox';
        input.className = 'form-check-input ' + clase;

        input.value = original !== undefined ? original : opcion;
        input.checked = original !== undefined;

        const texto = document.createElement('span');
        texto.textContent = opcion;

        etiqueta.append(input, texto);
        contenedor.appendChild(etiqueta);
    });
}

function categoriaParaFormulario(p, mapa) {
    const claves = Object.keys(mapa);

    return claves.find(
        etiqueta =>
            claveOpcion(etiqueta) === claveOpcion(p.categoria)
    ) || claves.find(
        etiqueta =>
            mapa[etiqueta] ===
            claveOpcion(p.categoriaSlug || p.categoria)
    ) || String(p.categoria || 'Ropa Urbana');
}

function prepararAyudasFormulario() {
    const telefono = document.getElementById('telefonoCheckout');

    if (telefono) {
        telefono.addEventListener('input', function() {
            const valor = telefono.value;

            telefono.value =
                (valor.startsWith('+') ? '+' : '') +
                valor.replace(/\D/g, '').slice(0, 15);
        });
    }

    const correo = document.getElementById('regEmail');

    if (!correo) return;

    const caja = document.createElement('div');
    caja.className = 'd-flex flex-wrap gap-2 mt-2';

    caja.setAttribute(
        'aria-label',
        'Completar dominio del correo, opcional'
    );

    ['gmail.com', 'outlook.com', 'hotmail.com'].forEach(
        function(dominio) {
            const boton = document.createElement('button');
            boton.type = 'button';
            boton.className = 'btn btn-sm btn-outline-secondary';
            boton.textContent = '@' + dominio;

            boton.onclick = function() {
                const usuario = correo.value.trim().split('@')[0];

                if (!usuario) {
                    mostrarAviso(
                        'Completar correo',
                        'Escribe primero la parte anterior al arroba.'
                    );

                    correo.focus();
                    return;
                }

                correo.value = usuario + '@' + dominio;

                correo.dispatchEvent(
                    new Event('input', { bubbles: true })
                );

                correo.focus();
            };

            caja.appendChild(boton);
        }
    );

    const ayuda = document.createElement('p');
    ayuda.className = 'small text-muted mt-2';

    ayuda.textContent =
        'Opcional: también puedes escribir cualquier dominio personalizado.';

    const destino = correo.closest('.input-group') || correo;

    destino.after(caja);
    caja.after(ayuda);
}