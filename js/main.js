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
    inicializarPanelAdminPedidos();
    cargarTablaUsuarios();
    configurarEventosTablaUsuarios();
    inicializarCheckout();
    inicializarGraficoVentas();
    prepararAyudasFormulario();
    renderizarHistorialUsuario();
    inicializarFavoritos();
    

    document.querySelectorAll('.btn-toggle-password').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const inputGroup = btn.closest('.input-group');
            const input = inputGroup ? inputGroup.querySelector('input') : null;
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
            const nombres = document.getElementById('regNombres')?.value.trim() || '';
            const apellidos = document.getElementById('regApellidos')?.value.trim() || '';
            const email = document.getElementById('regEmail')?.value.trim().toLowerCase() || '';
            const password = document.getElementById('regPassword')?.value || '';
            const confirmPassword = document.getElementById('confirmPassword')?.value || '';
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
                usuarios = JSON.parse(localStorage.getItem('usuarios_registrados')) || [];
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

            localStorage.setItem('usuarios_registrados', JSON.stringify(usuarios));
            mostrarAlerta('¡Cuenta creada con éxito! Redirigiendo...', 'success');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        });
    }

    const formLogin = document.getElementById('formLogin');
    if (formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email')?.value.trim().toLowerCase() || '';
            const password = document.getElementById('password')?.value || '';

            if (email === 'admin@modaestilo.cl' && password === 'admin123') {
                const adminUser = {
                    nombres: 'Administrador',
                    apellidos: '',
                    email: email,
                    rol: 'Administrador'
                };
                localStorage.setItem('usuario_activo', JSON.stringify(adminUser));
                await mostrarAviso('Inicio de sesión', '¡Bienvenido Administrador!');
                window.location.href = 'admin.html';
                return;
            }

            let usuarios = [];
            try {
                usuarios = JSON.parse(localStorage.getItem('usuarios_registrados')) || [];
            } catch (err) {
                usuarios = [];
            }

            const user = usuarios.find(u => u.email === email && u.password === password);
            if (user) {
                localStorage.setItem('usuario_activo', JSON.stringify(user));
                await mostrarAviso('Inicio de sesión', `¡Bienvenido de nuevo, ${user.nombres}!`);
                window.location.href = 'productos.html';
            } else {
                await mostrarAviso('No se pudo iniciar sesión', 'Correo o contraseña incorrectos.');
            }
        });
    }
});

const CARRITO_KEY = 'carrito_moda_estilo';
const VENTAS_KEY = 'ventas_moda_estilo';
const PEDIDOS_KEY = 'pedidos_moda_estilo';
const PRODUCTOS_KEY = 'productos_moda_estilo';

function obtenerCarrito() {
    try {
        const data = localStorage.getItem(CARRITO_KEY) || localStorage.getItem('carritoCompras');
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
    const totalItems = carrito.reduce((sum, item) => sum + (parseInt(item.cantidad, 10) || 0), 0);
    document.querySelectorAll('#contadorCarrito, .contador-carrito').forEach(span => {
        span.textContent = totalItems;
    });
}

function vincularBotonesAgregarCarrito() {
    document.addEventListener('click', (e) => {
        const btnCantidad = e.target.closest('.btn-sumar-cantidad, .btn-restar-cantidad');

if (btnCantidad) {
    e.preventDefault();

    const productoId = btnCantidad.dataset.productoId;

    const input = document.querySelector(
        `.cantidad-producto[data-producto-id="${productoId}"]`
    );

    if (!input) return;

    let cantidad = parseInt(input.value, 10) || 1;
    const maximo = parseInt(input.max, 10) || 1;

    if (btnCantidad.classList.contains('btn-sumar-cantidad')) {
        if (cantidad < maximo) {
            cantidad++;
        }
    }

    if (btnCantidad.classList.contains('btn-restar-cantidad')) {
        if (cantidad > 1) {
            cantidad--;
        }
    }

    input.value = cantidad;

    return;
}
        const btn = e.target.closest('.btn-agregar-carrito, [data-agregar-carrito]');
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
        let cantidad = 1;

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

                tarjetaClon
                    .querySelectorAll(
                        'del, s, .text-decoration-line-through, .precio-anterior, .text-muted'
                    )
                    .forEach(el => el.remove());

                const precioElem = tarjetaClon.querySelector(
                    '.text-gold, .fw-bold, .precio, .card-text, .price'
                ) || tarjetaClon;

                precio = precioElem
                    ? precioElem.textContent
                    : '0';
            }

            if (!imagen) {
                const imgElem = tarjeta.querySelector('img');

                imagen = imgElem
                    ? (imgElem.getAttribute('src') || imgElem.src)
                    : 'img/urbana.jpg';
            }

            if (!talla) {
                const selectTalla = tarjeta.querySelector('select');
                talla = selectTalla
                    ? selectTalla.value
                    : '';
            }

            const cantidadInput =
                tarjeta.querySelector('.cantidad-producto');

            cantidad = cantidadInput
                ? parseInt(cantidadInput.value, 10)
                : 1;

            const producto = obtenerProductoPorId(id);

            if (!Number.isSafeInteger(cantidad) || cantidad < 1) {
                mostrarAviso(
                    'Cantidad inválida',
                    'La cantidad debe ser de al menos 1 unidad.'
                );
                return;
            }

            if (producto && cantidad > Number(producto.stock)) {
                mostrarAviso(
                    'Stock insuficiente',
                    `Solo quedan ${producto.stock} unidades disponibles.`
                );
                return;
            }
        }

        const precioNumero = parsearPrecio(precio);

        agregarAlCarrito(
            nombre,
            precioNumero,
            imagen,
            talla,
            id,
            cantidad
        );

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
    id = null,
    cantidadSolicitada = 1
) {
    const nombreLimpio =
        typeof nombre === 'string' &&
        !nombre.includes('[object')
            ? nombre.trim()
            : 'Producto';

    const precioLimpio = parsearPrecio(precio);

    const imagenLimpia =
        typeof imagen === 'string' &&
        !imagen.includes('[object')
            ? imagen
            : 'img/urbana.jpg';

    const tallaLimpia =
        typeof talla === 'string'
            ? talla.trim()
            : 'Única';

    const cantidad = Number(cantidadSolicitada);

    if (!Number.isSafeInteger(cantidad) || cantidad < 1) {
        return;
    }

    let carrito = obtenerCarrito();

    const indice = carrito.findIndex(item =>
        (id
            ? String(item.id) === String(id)
            : item.nombre === nombreLimpio) &&
        String(item.talla || 'Única') ===
        String(tallaLimpia || 'Única')
    );

    const producto =
        id != null
            ? obtenerProductoPorId(id)
            : null;

    if (producto && producto.activo === false) {
        mostrarAviso(
            'Producto no disponible',
            'Este producto no está disponible actualmente.'
        );
        return;
    }

    if (producto) {
        const cantidadActual =
            indice !== -1
                ? parseInt(carrito[indice].cantidad, 10) || 0
                : 0;

        if (
            cantidadActual + cantidad >
            Number(producto.stock)
        ) {
            mostrarAviso(
                'Stock insuficiente',
                `Solo quedan ${producto.stock} unidades disponibles.`
            );
            return;
        }
    }

    if (indice !== -1) {
        carrito[indice].cantidad =
            (parseInt(carrito[indice].cantidad, 10) || 0) +
            cantidad;

        if (precioLimpio > 0) {
            carrito[indice].precio = precioLimpio;
        }
    } else {
        carrito.push({
            id: id ? parseInt(id, 10) : Date.now(),
            nombre: nombreLimpio,
            precio: precioLimpio,
            imagen: imagenLimpia,
            talla: tallaLimpia || 'Única',
            cantidad: cantidad
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
    const formatoCLP = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' });

    const resetTotales = () => {
        document.querySelectorAll('#subtotalCarrito, #totalCarrito, .subtotal-carrito, .total-carrito').forEach(el => {
            if (el) el.textContent = '$0';
        });
    };

    if (carrito.length === 0) {
        contenedor.innerHTML = '';
        if (carritoVacioMsg) carritoVacioMsg.classList.remove('d-none');
        if (contenidoCarrito) contenidoCarrito.classList.add('d-none');
        resetTotales();
        return;
    }

    if (carritoVacioMsg) carritoVacioMsg.classList.add('d-none');
    if (contenidoCarrito) contenidoCarrito.classList.remove('d-none');

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
                    <img src="${escaparHTML(item.imagen || 'img/urbana.jpg')}" alt="${escaparHTML(item.nombre)}" class="img-fluid rounded me-3" style="width: 50px; height: 50px; object-fit: cover;">
                    <div>
                        <h6 class="mb-0 fw-bold">${escaparHTML(item.nombre)}</h6>
                        <small class="text-muted">Talla: ${escaparHTML(item.talla || 'Única')}</small>
                    </div>
                </div>
            </td>
            <td>${formatoCLP.format(precio)}</td>
            <td>
                <input type="number" class="form-control form-control-sm cantidad-item" data-index="${index}" value="${cantidad}" min="1" max="10" style="width: 70px;">
            </td>
            <td class="fw-bold">${formatoCLP.format(subtotal)}</td>
            <td class="text-end">
                <button type="button" class="btn btn-sm btn-outline-danger btn-eliminar" data-index="${index}" title="Eliminar producto">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        contenedor.appendChild(tr);
    });

    const totalFormateado = formatoCLP.format(total);
    document.querySelectorAll('#subtotalCarrito, #totalCarrito, .subtotal-carrito, .total-carrito').forEach(elem => {
        elem.textContent = totalFormateado;
    });

    contenedor.querySelectorAll('.cantidad-item').forEach(input => {
        input.addEventListener('change', (e) => {
            const idx = parseInt(e.target.getAttribute('data-index'), 10);
            const nuevaCant = Number(e.target.value);
            let cart = obtenerCarrito();
            if (!cart[idx]) return;

            const producto = obtenerProductoPorId(cart[idx].id);

            const otrasUnidades = cart.reduce((total, item, posicion) => {
                if (
                    posicion !== idx &&
                    String(item.id) === String(cart[idx].id)
                ) {
                    return total + Number(item.cantidad);
                }

                return total;
            }, 0);

            if (
                !Number.isSafeInteger(nuevaCant) ||
                nuevaCant <= 0 ||
                !Number.isSafeInteger(otrasUnidades) ||
                otrasUnidades < 0 ||
                !producto ||
                producto.activo === false ||
                nuevaCant + otrasUnidades > Number(producto.stock)
            ) {
                mostrarAviso(
                    'Revisa la cantidad',
                    'Usa un número entero mayor que cero y dentro del stock disponible.'
                );
                renderizarCarrito();
                return;
            }

            cart[idx].cantidad = nuevaCant;
            guardarCarrito(cart);
            renderizarCarrito();
        });
    });

    contenedor.querySelectorAll('.btn-eliminar').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(e.currentTarget.getAttribute('data-index'), 10);
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

            const confirmado = await pedirConfirmacion('Vaciar carrito', '¿Quieres quitar todos los productos del carrito?');
            if (confirmado) {
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
                mostrarAviso('Carrito vacío', 'Agrega productos antes de proceder al pago.');
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
    if (formCheckout && formCheckout.dataset.inicializado === 'si') return;
    if (formCheckout) formCheckout.dataset.inicializado = 'si';

    const inputNumero = document.getElementById('numeroTarjeta');
    const inputExp = document.getElementById('expiracionTarjeta');
    const inputCvv = document.getElementById('cvvTarjeta');

    if (inputNumero) {
        inputNumero.addEventListener('input', (e) => {
            let valor = e.target.value.replace(/\D/g, '').substring(0, 16);
            let bloques = valor.match(/.{1,4}/g);
            e.target.value = bloques ? bloques.join(' ') : '';
        });
    }

    if (inputExp) {
        inputExp.addEventListener('input', (e) => {
            let valor = e.target.value.replace(/\D/g, '').substring(0, 4);
            e.target.value = valor.length >= 3 ? valor.substring(0, 2) + '/' + valor.substring(2, 4) : valor;
        });
    }

    if (inputCvv) {
        inputCvv.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '').substring(0, 3);
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
    const formatoCLP = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' });

    if (carrito.length === 0) {
        if (itemsContainer) itemsContainer.innerHTML = '<p class="text-muted small">No hay productos en el pedido.</p>';
        if (totalPagoElem) totalPagoElem.textContent = '$0';
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
                        <span class="fw-bold">${escaparHTML(item.nombre)}</span>
                        <span class="text-muted"> (${escaparHTML(item.talla || 'Única')})</span>
                        <span class="text-muted"> x${cantidad}</span>
                    </div>
                    <span class="fw-semibold">${formatoCLP.format(subtotal)}</span>
                </div>
            `;
        });
        if (itemsContainer) itemsContainer.innerHTML = htmlItems;
        if (totalPagoElem) totalPagoElem.textContent = formatoCLP.format(totalCalculado);
    }

    if (formCheckout) {
        let procesando = false;
        formCheckout.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (procesando) return;

            const boton = formCheckout.querySelector('button[type="submit"]');
            procesando = true;
            boton.disabled = true;

            try {
                // Validación estricta para números telefónicos de Chile (+569XXXXXXXX)
                const telefono = document.getElementById('telefonoCheckout');
                if (telefono && !/^\+569\d{8}$/.test(telefono.value)) {
                    await mostrarAviso('Teléfono inválido', 'Debes ingresar un número chileno de 9 dígitos válido (+569XXXXXXXX).');
                    return;
                }

                const carritoActual = obtenerCarrito();
                if (!carritoActual.length) {
                    await mostrarAviso('Carrito vacío', 'No hay productos en el pedido.');
                    return;
                }

                if (radioTarjeta && radioTarjeta.checked) {
                    const numero = inputNumero.value.replace(/\s/g, '');
                    const exp = inputExp.value.trim();

                    if (numero !== '4242424242424242') {
                        await mostrarAviso('Tarjeta de demostración', 'Usa solamente el número de prueba 4242 4242 4242 4242.');
                        return;
                    }

                    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(exp)) {
                        await mostrarAviso('Vencimiento inválido', 'Usa el formato MM/AA.');
                        return;
                    }

                    const [mes, anio] = exp.split('/').map(Number);
                    const finVigencia = new Date(2000 + anio, mes, 1);

                    if (finVigencia <= new Date()) {
                        await mostrarAviso(
                            'Tarjeta vencida',
                            'La fecha de vencimiento debe ser vigente.'
                        );
                        return;
                    }

                    if (inputCvv.value !== '123') {
                        await mostrarAviso('CVV de demostración', 'El CVV de prueba es 123.');
                        return;
                    }
                }
                const firmaCarrito = JSON.stringify(carritoActual);
                const firmaProductos = JSON.stringify(obtenerProductos());
                const firmaUsuario = localStorage.getItem('usuario_activo');

                const leerFormulario = () => JSON.stringify(
                    Array.from(
                        formCheckout.querySelectorAll('input, select, textarea')
                    ).map(campo => [
                        campo.id,
                        campo.value,
                        campo.checked
                    ])
                );

                const firmaFormulario = leerFormulario();
                const confirmado = await pedirConfirmacion(
                    'Confirmar compra simulada',
                    'Total: ' + totalPagoElem.textContent + '. ¿Quieres continuar con el pedido?'
                );
                if (!confirmado) return;
                if (
                    JSON.stringify(obtenerCarrito()) !== firmaCarrito ||
                    JSON.stringify(obtenerProductos()) !== firmaProductos ||
                    localStorage.getItem('usuario_activo') !== firmaUsuario ||
                    leerFormulario() !== firmaFormulario
                ) {
                    throw new Error(
                        'La compra cambió mientras confirmabas. Recarga la página y revisa nuevamente el resumen.'
                    );
                }

                const productosDB = obtenerProductos();
                let montoTotalVenta = 0;
                const cantidades = new Map();

                carritoActual.forEach(item => {
                    const cantidad = Number(item.cantidad);

                    if (!Number.isSafeInteger(cantidad) || cantidad <= 0) {
                        throw new Error(
                            'Hay una cantidad inválida en el carrito. Revísalo antes de comprar.'
                        );
                    }

                    const producto = productosDB.find(
                        p => String(p.id) === String(item.id)
                    );

                    if (!producto || producto.activo === false) {
                        throw new Error(
                            'Un producto del carrito ya no está disponible.'
                        );
                    }

                    const precioActual = Number(producto.precio);
                    const stockActual = Number(producto.stock);

                    if (
                        !Number.isSafeInteger(precioActual) ||
                        precioActual <= 0 ||
                        !Number.isSafeInteger(stockActual) ||
                        stockActual < 0
                    ) {
                        throw new Error(
                            'Un producto tiene información inválida. Contacta al administrador.'
                        );
                    }

                    if (Number(item.precio) !== precioActual) {
                        throw new Error(
                            'Cambió el precio de un producto. Quítalo del carrito y agrégalo nuevamente para revisar el precio actualizado.'
                        );
                    }

                    const id = String(item.id);
                    const acumulada = (cantidades.get(id) || 0) + cantidad;

                    if (!Number.isSafeInteger(acumulada)) {
                        throw new Error('La cantidad solicitada no es válida.');
                    }

                    cantidades.set(id, acumulada);
                    montoTotalVenta += precioActual * cantidad;

                    if (!Number.isSafeInteger(montoTotalVenta)) {
                        throw new Error('El total de la compra no es válido.');
                    }
                });

                cantidades.forEach((cantidad, id) => {
                    const producto = productosDB.find(
                        p => String(p.id) === id
                    );

                    if (cantidad > Number(producto.stock)) {
                        throw new Error(
                            'No queda stock suficiente para completar esta compra.'
                        );
                    }
                });

                cantidades.forEach((cantidad, id) => {
                    productosDB.find(p => String(p.id) === id).stock -= cantidad;
                });

                guardarProductos(productosDB);

                let usuarioActivo = null;
                try { usuarioActivo = JSON.parse(localStorage.getItem('usuario_activo')); } catch(err){}

                const nombre = document.getElementById('nombreCheckout')?.value || '';
                const apellido = document.getElementById('apellidoCheckout')?.value || '';
                const calle = document.getElementById('calleCheckout')?.value || '';
                const numeroDom = document.getElementById('numeroCheckout')?.value || '';
                const depto = document.getElementById('deptoCheckout')?.value || '';
                const comuna = document.getElementById('comunaCheckout')?.value || '';
                const ciudad = document.getElementById('ciudadCheckout')?.value || '';
                const region = document.getElementById('regionCheckout')?.value || '';
                const postal = document.getElementById('postalCheckout')?.value || '';
                const ref = document.getElementById('referenciaCheckout')?.value || '';

                const dirFormateada = `${calle} #${numeroDom}${depto ? ', Depto/Casa: ' + depto : ''}${ref ? ' (Ref: ' + ref + ')' : ''}`;
                const ubicaFormateada = `${comuna}, ${ciudad}, ${region} (CP: ${postal})`;

                const nuevoPedido = {
                    usuarioId: usuarioActivo && usuarioActivo.id != null
                        ? String(usuarioActivo.id)
                        : null,

                    fechaISO: new Date().toISOString(),
                    stockDescontado: true,
                    stockDevuelto: false,
                    id: 'PED-' + Math.floor(100000 + Math.random() * 900000),
                    fecha: new Date().toLocaleDateString('es-CL'),
                    clienteNombre: `${nombre} ${apellido}`.trim() || 'Cliente Sin Nombre',
                    clienteEmail: document.getElementById('correoCheckout')?.value || (usuarioActivo ? usuarioActivo.email : 'invitado@tienda.cl'),
                    clienteTelefono: document.getElementById('telefonoCheckout')?.value || 'No informado',
                    tipoUsuario: usuarioActivo ? (usuarioActivo.rol || 'Cliente Registrado') : 'Invitado',
                    direccion: dirFormateada,
                    comunaRegion: ubicaFormateada,
                    metodoPago: radioTarjeta && radioTarjeta.checked ? 'Tarjeta de Crédito/Débito' : 'Transferencia Bancaria',
                    estado: radioTarjeta && radioTarjeta.checked ? 'Recibido' : 'Pendiente de Pago',
                    total: montoTotalVenta,
                    items: carritoActual.map(i => ({
                        id: i.id,
                        nombre: i.nombre,
                        talla: i.talla || 'Única',
                        precioHistorico: i.precio,
                        cantidad: i.cantidad,
                        subtotal: i.precio * i.cantidad
                    }))
                };

                guardarNuevoPedido(nuevoPedido);
                registrarVentaHistorial(montoTotalVenta);

                localStorage.removeItem(CARRITO_KEY);
                localStorage.removeItem('carritoCompras');

                await mostrarAviso('¡Compra completada con éxito!', `Su pedido ${nuevoPedido.id} fue procesado correctamente.`);
                location.href = 'index.html';

            } catch (error) {
                await mostrarAviso('No se pudo completar', error.message);
            } finally {
                procesando = false;
                boton.disabled = false;
            }
        });
    }
}

const pedidosPorDefecto = [
    {
        id: "PED-102938",
        fecha: "20/09/2026",
        clienteNombre: "María González",
        clienteEmail: "maria.g@email.com",
        clienteTelefono: "+56987654321",
        tipoUsuario: "Cliente Registrado",
        direccion: "Av. Providencia 1234, Apto 502",
        comunaRegion: "Providencia, Región Metropolitana",
        metodoPago: "Tarjeta de Crédito/Débito",
        estado: "Entregado",
        total: 49980,
        items: [
            { id: 1, nombre: "Polera Oversize Negra", talla: "M - Medium", precioHistorico: 19990, cantidad: 1, subtotal: 19990 },
            { id: 2, nombre: "Pantalón Jean Classic", talla: "40 - M", precioHistorico: 29990, cantidad: 1, subtotal: 29990 }
        ]
    },
    {
        id: "PED-102939",
        fecha: "22/09/2026",
        clienteNombre: "Carlos Silva",
        clienteEmail: "carlos.silva@email.com",
        clienteTelefono: "+56911223344",
        tipoUsuario: "Cliente Registrado",
        direccion: "Calle Las Heras 456",
        comunaRegion: "Concepción, Región del Bío Bío",
        metodoPago: "Transferencia Bancaria",
        estado: "Pendiente de Pago",
        total: 45990,
        items: [
            { id: 3, nombre: "Chaqueta Formal Fit", talla: "L - Large", precioHistorico: 45990, cantidad: 1, subtotal: 45990 }
        ]
    }
];

function obtenerPedidos() {
    try {
        let p = localStorage.getItem(PEDIDOS_KEY);
        if (!p) {
            localStorage.setItem(PEDIDOS_KEY, JSON.stringify(pedidosPorDefecto));
            return pedidosPorDefecto;
        }
        return JSON.parse(p);
    } catch (e) {
        return [];
    }
}

function guardarNuevoPedido(nuevoPedido) {
    let pedidos = obtenerPedidos();
    pedidos.unshift(nuevoPedido);
    localStorage.setItem(PEDIDOS_KEY, JSON.stringify(pedidos));
}

function actualizarEstadoPedidoEnStorage(idPedido, nuevoEstado) {
    const pedidos = obtenerPedidos();
    const pedido = pedidos.find(p => p.id === idPedido);

    if (!pedido) {
        throw new Error('El pedido ya no existe.');
    }

    if (pedido.estado === nuevoEstado) return;

    const transiciones = {
        'Pendiente de Pago': ['Recibido', 'Cancelado'],
        'Recibido': ['Preparando', 'Cancelado'],
        'Preparando': ['Enviado', 'Cancelado'],
        'Enviado': ['Entregado'],
        'Entregado': [],
        'Cancelado': []
    };

    const permitidos = transiciones[pedido.estado] || [];

    if (!permitidos.includes(nuevoEstado)) {
        throw new Error(
            `No se puede pasar de "${pedido.estado}" a "${nuevoEstado}".`
        );
    }

    let productosOriginales = null;

    if (nuevoEstado === 'Cancelado' && !pedido.stockDevuelto) {
        if (pedido.stockDescontado !== true) {
            throw new Error(
                'Este pedido antiguo o de ejemplo no tiene registro del descuento de stock. Debe revisarse antes de devolver existencias.'
            );
        }

        productosOriginales = obtenerProductos();

        const productos = productosOriginales.map(
            producto => ({ ...producto })
        );

        pedido.items.forEach(item => {
            const cantidad = Number(item.cantidad);

            if (!Number.isSafeInteger(cantidad) || cantidad <= 0) {
                throw new Error(
                    'El pedido contiene una cantidad inválida.'
                );
            }

            const producto = productos.find(
                p => String(p.id) === String(item.id)
            );

            // Un producto eliminado no se vuelve a crear automáticamente.
            if (!producto) return;

            const nuevoStock = Number(producto.stock) + cantidad;

            if (!Number.isSafeInteger(nuevoStock) || nuevoStock < 0) {
                throw new Error(
                    'No se pudo calcular la devolución de stock.'
                );
            }

            producto.stock = nuevoStock;
        });

        guardarProductos(productos);
        pedido.stockDevuelto = true;
    }

    pedido.estado = nuevoEstado;
    pedido.actualizadoEn = new Date().toISOString();

    try {
        localStorage.setItem(PEDIDOS_KEY, JSON.stringify(pedidos));
    } catch (error) {
        // Recupera el stock si falla el guardado del pedido.
        if (productosOriginales) {
            guardarProductos(productosOriginales);
        }

        throw error;
    }
}

function obtenerBadgeEstadoPedido(estado) {
    switch (estado) {
        case 'Entregado': return 'bg-success';
        case 'Enviado': return 'bg-info text-dark';
        case 'Preparando': return 'bg-primary';
        case 'Recibido': return 'bg-warning text-dark';
        case 'Pendiente de Pago': return 'bg-secondary';
        case 'Cancelado': return 'bg-danger';
        default: return 'bg-dark';
    }
}

function inicializarPanelAdminPedidos() {
    const tablaPedidos = document.getElementById('tablaAdminPedidos');
    if (!tablaPedidos) return;

    const filtroBuscar = document.getElementById('filtroBuscarPedido');
    const filtroEstado = document.getElementById('filtroEstadoPedido');
    const modalEl = document.getElementById('modalDetallePedido');
    const modalDetalle = modalEl ? new bootstrap.Modal(modalEl) : null;
    let pedidoSeleccionadoActual = null;

    function renderTablaPedidos() {
        const pedidos = obtenerPedidos();
        const textoBusqueda = filtroBuscar ? filtroBuscar.value.toLowerCase().trim() : '';
        const estadoFiltro = filtroEstado ? filtroEstado.value : 'TODOS';

        tablaPedidos.innerHTML = '';
        const filtrados = pedidos.filter(p => {
            const coincideTexto = p.id.toLowerCase().includes(textoBusqueda) || p.clienteNombre.toLowerCase().includes(textoBusqueda);
            const coincideEstado = estadoFiltro === 'TODOS' || p.estado === estadoFiltro;
            return coincideTexto && coincideEstado;
        });

        if (filtrados.length === 0) {
            tablaPedidos.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">No se encontraron pedidos.</td></tr>`;
            return;
        }

        filtrados.forEach(p => {
            const badgeClase = obtenerBadgeEstadoPedido(p.estado);
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="fw-bold text-gold">${p.id}</td>
                <td>${p.fecha}</td>
                <td>${escaparHTML(p.clienteNombre)}</td>
                <td><small class="text-muted">${escaparHTML(p.metodoPago)}</small></td>
                <td class="fw-bold">$${p.total.toLocaleString('es-CL')}</td>
                <td><span class="badge ${badgeClase}">${p.estado}</span></td>
                <td class="text-center">
                    <button type="button" class="btn btn-sm btn-gold btn-ver-pedido" data-id="${p.id}" title="Ver Detalle">
                        <i class="bi bi-eye-fill"></i> Ver Detalle
                    </button>
                </td>
            `;
            tablaPedidos.appendChild(tr);
        });
    }

    if (filtroBuscar) filtroBuscar.addEventListener('input', renderTablaPedidos);
    if (filtroEstado) filtroEstado.addEventListener('change', renderTablaPedidos);

    tablaPedidos.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-ver-pedido');
        if (btn) {
            const id = btn.getAttribute('data-id');
            const pedidos = obtenerPedidos();
            const p = pedidos.find(item => item.id === id);
            if (p) {
                pedidoSeleccionadoActual = p;
                abrirModalDetallePedido(p);
            }
        }
    });

    function abrirModalDetallePedido(p) {
        document.getElementById('modalPedidoTitulo').textContent = `Detalle del Pedido ${p.id}`;
        document.getElementById('detPedidoCliente').innerHTML = `<strong>Cliente:</strong> ${escaparHTML(p.clienteNombre)}`;
        document.getElementById('detPedidoEmail').innerHTML = `<strong>Correo:</strong> ${escaparHTML(p.clienteEmail)}`;
        document.getElementById('detPedidoTelefono').innerHTML = `<strong>Teléfono:</strong> ${escaparHTML(p.clienteTelefono)}`;
        document.getElementById('detPedidoTipoUsuario').innerHTML = `<strong>Tipo:</strong> ${escaparHTML(p.tipoUsuario)}`;
        document.getElementById('detPedidoDireccion').innerHTML = `<strong>Dirección:</strong> ${escaparHTML(p.direccion)}`;
        document.getElementById('detPedidoComunaRegion').innerHTML = `<strong>Ubicación:</strong> ${escaparHTML(p.comunaRegion)}`;

        const selectEstado = document.getElementById('selectEstadoPedidoModal');
        if (selectEstado) selectEstado.value = p.estado;

        const tbodyItems = document.getElementById('tablaDetalleProductosPedido');
        tbodyItems.innerHTML = '';
        p.items.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${escaparHTML(item.nombre)}</td>
                <td><span class="badge bg-light text-dark border">${escaparHTML(item.talla)}</span></td>
                <td>$${item.precioHistorico.toLocaleString('es-CL')}</td>
                <td>${item.cantidad}</td>
                <td class="fw-bold">$${item.subtotal.toLocaleString('es-CL')}</td>
            `;
            tbodyItems.appendChild(tr);
        });

        document.getElementById('detPedidoTotal').textContent = `$${p.total.toLocaleString('es-CL')}`;
        if (modalDetalle) modalDetalle.show();
    }

    const btnGuardarEstado =
        document.getElementById('btnGuardarEstadoPedido');

    if (btnGuardarEstado) {
        btnGuardarEstado.onclick = async () => {
            if (!pedidoSeleccionadoActual || btnGuardarEstado.disabled) {
                return;
            }

            btnGuardarEstado.disabled = true;

            try {
                const nuevoEstado =
                    document.getElementById('selectEstadoPedidoModal').value;

                actualizarEstadoPedidoEnStorage(
                    pedidoSeleccionadoActual.id,
                    nuevoEstado
                );

                if (modalDetalle) {
                    modalDetalle.hide();
                }

                renderTablaPedidos();

                document.dispatchEvent(
                    new Event('productosActualizados')
                );

                inicializarGraficoVentas();

                await mostrarAviso(
                    'Pedido actualizado',
                    'Se guardó el estado del pedido.'
                );
            } catch (error) {
                await mostrarAviso(
                    'No se pudo actualizar',
                    error.message
                );
            } finally {
                btnGuardarEstado.disabled = false;
            }
        };
    }

    renderTablaPedidos();
}

function registrarVentaHistorial(monto) {
    try {
        let ventas = JSON.parse(localStorage.getItem(VENTAS_KEY)) || [];
        ventas.push({ monto: monto, fecha: new Date().toISOString() });
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
    const ahora = new Date();

    const estadosContabilizados = [
        'Recibido',
        'Preparando',
        'Enviado',
        'Entregado'
    ];

    const ventas = obtenerPedidos()
        .filter(p =>
            estadosContabilizados.includes(p.estado) &&
            p.fechaISO &&
            Number.isFinite(Number(p.total))
        )
        .map(p => ({
            monto: Number(p.total),
            fecha: new Date(p.fechaISO)
        }))
        .filter(v => !Number.isNaN(v.fecha.getTime()));

    const totalMes = ventas
        .filter(v =>
            v.fecha.getFullYear() === ahora.getFullYear() &&
            v.fecha.getMonth() === ahora.getMonth()
        )
        .reduce((total, venta) => total + venta.monto, 0);

    const dashVentasMes = document.getElementById('dashVentasMes');

    if (dashVentasMes) {
        dashVentasMes.textContent =
            '$' + totalMes.toLocaleString('es-CL');
    }

    function claveDia(fecha) {
        return [
            fecha.getFullYear(),
            fecha.getMonth(),
            fecha.getDate()
        ].join('-');
    }

    const dias = Array.from({ length: 7 }, (_, indice) => {
        return new Date(
            ahora.getFullYear(),
            ahora.getMonth(),
            ahora.getDate() - 6 + indice
        );
    });

    const etiquetasGrafico = dias.map(fecha =>
        fecha.toLocaleDateString('es-CL', {
            day: '2-digit',
            month: '2-digit'
        })
    );

    const datosGrafico = dias.map(dia =>
        ventas
            .filter(venta =>
                claveDia(venta.fecha) === claveDia(dia)
            )
            .reduce((total, venta) => total + venta.monto, 0)
    );

    window.miGraficoVentasInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: etiquetasGrafico,
            datasets: [{
                label: 'Ventas ($)',
                data: datosGrafico,
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
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return '$' + context.parsed.y.toLocaleString('es-CL');
                        }
                    }
                }
            },
            scales: {
                x: { grid: { display: false } },
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) { return '$' + (value / 1000) + 'k'; }
                    }
                }
            }
        }
    });
}

function actualizarNavbarUsuario() {
    let usuarioActivo = null;
    try {
        usuarioActivo = JSON.parse(localStorage.getItem('usuario_activo'));
    } catch (e) {
        usuarioActivo = null;
    }

    const navDerecho = document.querySelector('.navbar-nav.ms-auto');
    if (!navDerecho) return;

    if (usuarioActivo) {
        navDerecho.querySelectorAll('li').forEach(li => {
            const a = li.querySelector('a');
            if (a && (a.getAttribute('href') === 'login.html' || a.getAttribute('href') === 'registro.html')) {
                li.remove();
            }
        });

        const liUsuario = document.createElement('li');
        liUsuario.className = 'nav-item dropdown';
        liUsuario.innerHTML = `
            <a class="nav-link dropdown-toggle fw-semibold text-warning" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                <i class="bi bi-person-circle me-1"></i>
                ${escaparHTML(usuarioActivo.nombres)} ${escaparHTML(usuarioActivo.apellidos || '')}
            </a>
            <ul class="dropdown-menu dropdown-menu-end bg-dark border-secondary" aria-labelledby="userDropdown">
            <li>
                <a class="dropdown-item text-light" href="favoritos.html">
                    <i class="bi bi-heart-fill me-2"></i>
                    Mis favoritos
                </a>
            </li>
                ${usuarioActivo.rol === 'Administrador' ? '<li><a class="dropdown-item text-light" href="admin.html"><i class="bi bi-speedometer2 me-2"></i>Panel Admin</a></li><li><hr class="dropdown-divider border-secondary"></li>' : ''}
                <li><a class="dropdown-item text-light" href="mis-compras.html"><i class="bi bi-bag-check me-2"></i>Mis Compras</a></li>
                <li><hr class="dropdown-divider border-secondary"></li>
                <li>
                    <a class="dropdown-item text-danger fw-semibold" href="#" id="btnCerrarSesion">
                        <i class="bi bi-box-arrow-right me-2"></i> Cerrar Sesión
                    </a>
                </li>
            </ul>
        `;
        navDerecho.appendChild(liUsuario);

        const btnLogout = liUsuario.querySelector('#btnCerrarSesion');
        if (btnLogout) btnLogout.addEventListener('click', cerrarSesion);
    }
}

async function cerrarSesion(e) {
    if (e) e.preventDefault();
    localStorage.removeItem('usuario_activo');
    await mostrarAviso('Sesión cerrada', 'Has cerrado sesión correctamente.');
    window.location.href = 'index.html';
}

const productosPorDefecto = [
    { id: 1, nombre: "Polera Oversize Negra", categoria: "Ropa Urbana", categoriaSlug: "urbano", precio: 19990, img: "img/urbana.jpg", desc: "Polera de algodón 100% con estilo urbano holgado.", tallas: ["S - Small", "M - Medium", "L - Large", "XL - Extra Large"], stock: 15 },
    { id: 2, nombre: "Pantalón Jean Classic", categoria: "Ropa Casual", categoriaSlug: "casual", precio: 29990, img: "img/casual.jpg", desc: "Jeans de corte recto con material resistente y flexible.", tallas: ["38 - S", "40 - M", "42 - L", "44 - XL"], stock: 8 },
    { id: 3, nombre: "Chaqueta Formal Fit", categoria: "Ropa Formal", categoriaSlug: "formal", precio: 45990, img: "img/formal.jpg", desc: "Chaqueta de diseño elegante para eventos especiales.", tallas: ["S - Small", "M - Medium", "L - Large"], stock: 10 },
    { id: 4, nombre: "Gorro Beanie Urbano", categoria: "Accesorios", categoriaSlug: "accesorios", precio: 8990, img: "img/accesorios.jpg", desc: "Gorro tejido de lana acrílica perfecto para complementar.", tallas: ["Talla Única (Estandard)"], stock: 20 }
];

function inicializarProductos() {
    if (!localStorage.getItem(PRODUCTOS_KEY)) {
        localStorage.setItem(PRODUCTOS_KEY, JSON.stringify(productosPorDefecto));
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
    return obtenerProductos().find(p => String(p.id) === String(id));
}

function agregarProducto(producto) {
    const productos = obtenerProductos();
    productos.push(producto);
    guardarProductos(productos);
}

function actualizarProducto(productoActualizado) {
    const productos = obtenerProductos();
    const index = productos.findIndex(p => String(p.id) === String(productoActualizado.id));
    if (index !== -1) {
        productos[index] = { ...productos[index], ...productoActualizado };
        guardarProductos(productos);
    }
}

function eliminarProducto(id) {
    const productos = obtenerProductos().filter(p => String(p.id) !== String(id));
    guardarProductos(productos);
}

function calcularEstadoStock(stock) {
    if (stock === 0) return { texto: 'Agotado', clase: 'bg-danger' };
    if (stock <= 5) return { texto: 'Poco Stock', clase: 'bg-warning text-dark' };
    return { texto: 'Disponible', clase: 'bg-success' };
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
        const opcionesTallas = (p.tallas || ['Talla Única'])
            .map(t => `
                <option value="${escaparHTML(t)}">
                    ${escaparHTML(t)}
                </option>
            `)
            .join('');

        const stockDisponible = parseInt(p.stock, 10) || 1;

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

                        <select 
                            class="form-select form-select-sm"
                            data-talla-producto="${p.id}"
                        >
                            ${opcionesTallas}
                        </select>
                    </div>

                    <div class="mb-3">
                        <label class="form-label small text-muted">
                            Cantidad:
                        </label>

                        <div class="input-group input-group-sm">
                            <button 
                                type="button"
                                class="btn btn-outline-dark btn-restar-cantidad"
                                data-producto-id="${p.id}"
                            >
                                −
                            </button>

                            <input 
                                type="number"
                                class="form-control text-center cantidad-producto"
                                data-producto-id="${p.id}"
                                min="1"
                                max="${stockDisponible}"
                                value="1"
                            >

                            <button 
                                type="button"
                                class="btn btn-outline-dark btn-sumar-cantidad"
                                data-producto-id="${p.id}"
                            >
                                +
                            </button>
                        </div>

                        <small class="text-muted">
                            Stock disponible: ${stockDisponible}
                        </small>
                    </div>

                    <div class="d-flex justify-content-between align-items-center mt-auto mb-3">
                        <span class="fs-5 fw-bold text-dark">
                            ${formatoCLP.format(p.precio)}
                        </span>
                    </div>

                    <button 
                        class="btn btn-dark w-100 btn-agregar-carrito"
                        data-id="${p.id}"
                        data-nombre="${escaparHTML(p.nombre)}"
                        data-precio="${p.precio}"
                        data-imagen="${escaparHTML(p.img)}"
                    >
                        <i class="bi bi-cart-plus me-1"></i>
                        Agregar al carrito
                    </button>

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
    const modalProducto = modalEl ? new bootstrap.Modal(modalEl) : null;
    const form = document.getElementById('formProductoAdmin');
    const tituloModal = document.getElementById('modalProductoTitulo');
    const inputIdEditar = document.getElementById('filaIndexEditar');

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
                <td><span class="badge ${estado.clase}">${estado.texto}</span></td>
                <td class="text-center">
                    <button type="button" class="btn btn-sm btn-outline-secondary me-1 btn-editar-producto" data-id="${p.id}" title="Editar">
                        <i class="bi bi-pencil-square"></i>
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-danger btn-eliminar-producto" data-id="${p.id}" title="Eliminar">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(fila);
        });

        const dashStock = document.getElementById('dashTotalStock');
        const dashAlertas = document.getElementById('dashAlertas');
        if (dashStock) dashStock.textContent = `${totalStock} prendas`;
        if (dashAlertas) dashAlertas.textContent = `${alertas} ítems bajos`;
    }

    document.addEventListener(
        'productosActualizados',
        renderTablaAdmin
    );  

    const btnAbrir = document.getElementById('btnAbrirModalAgregar');
    if (btnAbrir) {
        btnAbrir.addEventListener('click', () => {
            form.reset();
            inputIdEditar.value = '-1';
            tituloModal.textContent = 'Agregar Producto';
            if (modalProducto) modalProducto.show();
        });
    }

    tbody.addEventListener('click', async (e) => {
        const editar = e.target.closest('.btn-editar-producto');
        const eliminar = e.target.closest('.btn-eliminar-producto');

        if (editar) {
            const p = obtenerProductoPorId(editar.dataset.id);
            if (!p) return;
            inputIdEditar.value = p.id;
            document.getElementById('prodNombre').value = p.nombre;
            document.getElementById('prodCategoria').value = p.categoria;
            document.getElementById('prodPrecio').value = p.precio;
            document.getElementById('prodStock').value = p.stock;
            document.getElementById('prodImagen').value = p.img || '';
            document.getElementById('prodDescripcion').value = p.desc || '';
            document.getElementById('prodTallas').value = Array.isArray(p.tallas) ? p.tallas.join(', ') : (p.tallas || '');
            tituloModal.textContent = 'Editar Producto';
            if (modalProducto) modalProducto.show();
        }

        if (eliminar) {
            const p = obtenerProductoPorId(eliminar.dataset.id);
            if (!p) return;
            const confirmado = await pedirConfirmacion('Eliminar producto', `¿Eliminar "${p.nombre}" del catálogo?`);
            if (confirmado) {
                eliminarProducto(p.id);
                renderTablaAdmin();
            }
        }
    });

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = inputIdEditar.value;
            const nombre = document.getElementById('prodNombre').value.trim();
            const categoria = document.getElementById('prodCategoria').value;
            const precio = Number(document.getElementById('prodPrecio').value);
            const stock = Number(document.getElementById('prodStock').value);
            const img = document.getElementById('prodImagen').value.trim() || 'img/urbana.jpg';
            const desc = document.getElementById('prodDescripcion').value.trim();
            const tallasTexto = document.getElementById('prodTallas').value.trim();
            const tallas = tallasTexto ? tallasTexto.split(',').map(t => t.trim()) : ['Talla Única'];

            const categorias = {
                'Ropa Urbana': 'urbano',
                'Ropa Casual': 'casual',
                'Ropa Formal': 'formal',
                'Accesorios': 'accesorios'
            };

            const productoData = {
                id: id !== '-1' ? Number(id) : Date.now(),
                nombre,
                categoria,
                categoriaSlug: categorias[categoria],
                precio,
                stock,
                img,
                desc,
                tallas
            };  

            if (id !== '-1') {
                actualizarProducto(productoData);
            } else {
                agregarProducto(productoData);
            }

            if (modalProducto) modalProducto.hide();
            renderTablaAdmin();
        });
    }

    renderTablaAdmin();
}

function cargarTablaUsuarios() {
    const tablaUsuarios = document.getElementById('tablaAdminUsuarios');
    const badgeTotal = document.getElementById('totalUsuariosBadge');
    if (!tablaUsuarios) return;

    const usuariosPorDefecto = [
        { id: 101, nombres: "Juan", apellidos: "Pérez", email: "admin@modaestilo.cl", rol: "Administrador" },
        { id: 102, nombres: "María", apellidos: "González", email: "maria.g@email.com", rol: "Cliente" },
        { id: 103, nombres: "Carlos", apellidos: "Silva", email: "carlos.silva@email.com", rol: "Cliente" }
    ];

    let usuarios = [];
    try {
        usuarios = JSON.parse(localStorage.getItem('usuarios_registrados'));
    } catch (e) {
        usuarios = null;
    }

    if (!usuarios || usuarios.length === 0) {
        usuarios = usuariosPorDefecto;
        localStorage.setItem('usuarios_registrados', JSON.stringify(usuarios));
    }

    if (badgeTotal) badgeTotal.textContent = `${usuarios.length} registrados`;

    tablaUsuarios.innerHTML = '';
    usuarios.forEach((u, index) => {
        const esAdmin = u.rol === 'Administrador' || u.email === 'admin@modaestilo.cl';
        const badgeRol = esAdmin ? '<span class="badge bg-dark">Administrador</span>' : '<span class="badge bg-secondary">Cliente</span>';
        const nombreCompleto = `${u.nombres || ''} ${u.apellidos || ''}`.trim() || 'Usuario Desconocido';

        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>#${String(u.id || index + 1).slice(-3)}</td>
            <td class="fw-bold">${escaparHTML(nombreCompleto)}</td>
            <td>${escaparHTML(u.email)}</td>
            <td>${badgeRol}</td>
            <td class="text-center">
                <button type="button" class="btn btn-sm btn-outline-danger btn-eliminar-usuario" data-index="${index}" title="Eliminar Usuario">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        tablaUsuarios.appendChild(fila);
    });
}

function configurarEventosTablaUsuarios() {
    const tablaUsuarios = document.getElementById('tablaAdminUsuarios');
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
    let usuarios = JSON.parse(localStorage.getItem('usuarios_registrados')) || [];
    const user = usuarios[index];
    const nombre = user ? `${user.nombres} ${user.apellidos}`.trim() : 'este usuario';

    const confirmado = await pedirConfirmacion('Eliminar usuario', `¿Estás seguro de que deseas eliminar a ${nombre}?`);
    if (confirmado) {
        usuarios.splice(index, 1);
        localStorage.setItem('usuarios_registrados', JSON.stringify(usuarios));
        cargarTablaUsuarios();
    }
}

let modalEnUso = false;
function abrirDialogo(opciones) {
    if (modalEnUso) return Promise.resolve(false);
    modalEnUso = true;

    const anterior = document.activeElement;
    const dialogo = document.createElement('dialog');
    dialogo.id = 'modalAccion';
    dialogo.style.cssText = `
        width: min(480px, 90vw); box-sizing: border-box; border: 0; border-radius: 14px;
        padding: 24px; color: #222; background: white; box-shadow: 0 12px 60px #0005;
        font: 16px Arial, sans-serif; max-height: 85vh; overflow: auto;
    `;

    dialogo.innerHTML = `
        <h2 id="tituloAccion" style="font-size:22px; margin:0 0 16px;"></h2>
        <div id="contenidoAccion" style="line-height:1.5;"></div>
        <div style="display:flex; gap:12px; justify-content:flex-end; margin-top:24px;">
            <button id="cancelarAccion" type="button">Cancelar</button>
            <button id="aceptarAccion" type="button">Aceptar</button>
        </div>
    `;

    dialogo.querySelector('#tituloAccion').textContent = opciones.titulo;
    dialogo.querySelector('#contenidoAccion').innerHTML = opciones.html;

    const aceptar = dialogo.querySelector('#aceptarAccion');
    const cancelar = dialogo.querySelector('#cancelarAccion');

    aceptar.textContent = opciones.aceptar || 'Aceptar';
    cancelar.textContent = opciones.cancelar || 'Cancelar';
    cancelar.hidden = opciones.soloAceptar === true;

    [aceptar, cancelar].forEach(b => {
        b.style.cssText = 'padding: 10px 18px; border: 1px solid #222; border-radius: 8px; cursor: pointer; font: inherit; background: white; color: #222;';
    });
    aceptar.style.background = '#222';
    aceptar.style.color = 'white';

    document.body.appendChild(dialogo);

    return new Promise(resolve => {
        let aceptado = false;
        aceptar.addEventListener('click', () => { aceptado = true; dialogo.close(); });
        cancelar.addEventListener('click', () => dialogo.close());
        dialogo.addEventListener('close', () => {
            dialogo.remove();
            modalEnUso = false;
            if (anterior && anterior.isConnected) anterior.focus();
            resolve(aceptado);
        }, { once: true });
        dialogo.showModal();
        aceptar.focus();
    });
}

function mostrarAviso(titulo, texto) {
    return abrirDialogo({ titulo, html: '<p>' + escaparHTML(texto) + '</p>', aceptar: 'Entendido', soloAceptar: true });
}

function pedirConfirmacion(titulo, texto) {
    return abrirDialogo({ titulo, html: '<p>' + escaparHTML(texto) + '</p>', aceptar: 'Confirmar' });
}

// Función de control en tiempo real para el campo de teléfono chileno (+569XXXXXXXX)
function prepararAyudasFormulario() {
    const telefono = document.getElementById('telefonoCheckout');
    if (telefono) {
        telefono.addEventListener('focus', function() {
            if (!telefono.value.trim()) {
                telefono.value = '+569';
            }
        });

        telefono.addEventListener('input', function() {
            let valor = telefono.value;

            if (!valor.startsWith('+569')) {
                valor = '+569' + valor.replace(/^\+?5?6?9?/, '');
            }

            const numerosAdicionales = valor.slice(4).replace(/\D/g, '').slice(0, 8);
            telefono.value = '+569' + numerosAdicionales;
        });
    }
}

function renderizarHistorialUsuario() {
    const contenedor = document.getElementById('contenedorHistorialUsuario');
    if (!contenedor) return;

    let usuarioActivo = null;
    try { usuarioActivo = JSON.parse(localStorage.getItem('usuario_activo')); } catch(e){}

    if (!usuarioActivo) {
        contenedor.innerHTML = '<div class="alert alert-warning text-center">Debes iniciar sesión para ver tu historial de compras.</div>';
        return;
    }

    const pedidos = obtenerPedidos();
    const misPedidos = usuarioActivo.id == null
    ? []
    : pedidos.filter(p =>
        p.usuarioId != null &&
        String(p.usuarioId) === String(usuarioActivo.id)
    );

    if (misPedidos.length === 0) {
        contenedor.innerHTML = '<div class="alert alert-light text-center border">Aún no has realizado ninguna compra.</div>';
        return;
    }

    contenedor.innerHTML = misPedidos.map(p => `
        <div class="card mb-3 border-0 shadow-sm">
            <div class="card-header bg-white d-flex justify-content-between align-items-center py-3">
                <div>
                    <span class="fw-bold text-dark me-2">Pedido ${p.id}</span>
                    <small class="text-muted">(${p.fecha})</small>
                </div>
                <span class="badge ${obtenerBadgeEstadoPedido(p.estado)}">${p.estado}</span>
            </div>
            <div class="card-body">
                <div class="row mb-3 small text-muted">
                    <div class="col-md-6">
                        <strong>Envío a:</strong> ${escaparHTML(p.direccion)}, ${escaparHTML(p.comunaRegion)}
                    </div>
                    <div class="col-md-6 text-md-end">
                        <strong>Método de pago:</strong> ${escaparHTML(p.metodoPago)}
                    </div>
                </div>
                <div class="table-responsive">
                    <table class="table table-sm align-middle mb-0">
                        <tbody>
                            ${p.items.map(item => `
                                <tr>
                                    <td>${escaparHTML(item.nombre)} <span class="badge bg-light text-dark border ms-1">${escaparHTML(item.talla)}</span></td>
                                    <td class="text-center">x${item.cantidad}</td>                                     <td class="text-end fw-semibold">$${item.subtotal.toLocaleString('es-CL')}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                <hr class="my-2">
                <div class="d-flex justify-content-between align-items-center pt-2">
                    <span class="fw-bold">Total Pagado</span>
                    <span class="fs-5 fw-bold text-dark">$${p.total.toLocaleString('es-CL')}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// ===== FAVORITOS =====

function obtenerUsuarioFavoritos() {
    try {
        const usuario = JSON.parse(
            localStorage.getItem('usuario_activo')
        );

        if (!usuario) return null;

        const identidad = usuario.id != null
            ? 'id:' + String(usuario.id)
            : 'email:' + String(usuario.email || '').trim().toLowerCase();

        if (identidad === 'email:') return null;

        return {
            usuario,
            clave: 'favoritos_moda_estilo:' + identidad
        };
    } catch (error) {
        return null;
    }
}

function obtenerFavoritos() {
    const cuenta = obtenerUsuarioFavoritos();

    if (!cuenta) return [];

    try {
        const guardados = JSON.parse(
            localStorage.getItem(cuenta.clave)
        ) || [];

        if (!Array.isArray(guardados)) return [];

        return [...new Set(guardados.map(String))];
    } catch (error) {
        return [];
    }
}

function guardarFavoritos(ids) {
    const cuenta = obtenerUsuarioFavoritos();

    if (!cuenta) return false;

    localStorage.setItem(
        cuenta.clave,
        JSON.stringify([...new Set(ids.map(String))])
    );

    return true;
}

function actualizarBotonesFavoritos() {
    const favoritos = new Set(obtenerFavoritos());

    document.querySelectorAll('.btn-favorito').forEach(boton => {
        const seleccionado = favoritos.has(
            String(boton.dataset.id)
        );

        const texto = seleccionado
            ? 'Quitar de favoritos'
            : 'Agregar a favoritos';

        boton.setAttribute('aria-pressed', String(seleccionado));
        boton.setAttribute('aria-label', texto);
        boton.title = texto;

        const icono = boton.querySelector('i');

        if (icono) {
            icono.classList.toggle('bi-heart', !seleccionado);
            icono.classList.toggle('bi-heart-fill', seleccionado);
        }
    });
}

async function alternarFavorito(id) {
    if (!obtenerUsuarioFavoritos()) {
        await mostrarAviso(
            'Inicia sesión',
            'Inicia sesión con tu cuenta para guardar favoritos.'
        );
        return;
    }

    const productoId = String(id);
    const favoritos = obtenerFavoritos();
    const yaGuardado = favoritos.includes(productoId);

    if (!yaGuardado) {
        const producto = obtenerProductoPorId(productoId);

        if (!producto || producto.activo === false) {
            await mostrarAviso(
                'Producto no disponible',
                'Este producto ya no está disponible en el catálogo.'
            );
            return;
        }
    }

    const actualizados = yaGuardado
        ? favoritos.filter(guardado => guardado !== productoId)
        : [...favoritos, productoId];

    try {
        guardarFavoritos(actualizados);
    } catch (error) {
        await mostrarAviso(
            'No se pudo guardar',
            'El navegador no pudo guardar el cambio. Inténtalo nuevamente.'
        );
        return;
    }

    actualizarBotonesFavoritos();
    renderizarFavoritos();
}

function inicializarFavoritos() {
    // Evita registrar el evento varias veces.
    if (document.documentElement.dataset.favoritosListos === 'si') {
        return;
    }

    document.documentElement.dataset.favoritosListos = 'si';

    document.addEventListener('click', async (event) => {
        const boton = event.target.closest('.btn-favorito');

        if (!boton) return;

        event.preventDefault();

        if (boton.disabled) return;

        boton.disabled = true;

        try {
            await alternarFavorito(boton.dataset.id);
        } finally {
            boton.disabled = false;
        }
    });

    // Actualiza la vista cuando otra pestaña cambia favoritos o sesión.
    window.addEventListener('storage', (event) => {
        if (
            event.key === null ||
            event.key === 'usuario_activo' ||
            event.key === PRODUCTOS_KEY ||
            event.key.startsWith('favoritos_moda_estilo:')
        ) {
            actualizarBotonesFavoritos();
            renderizarFavoritos();
        }
    });

    actualizarBotonesFavoritos();
    renderizarFavoritos();
}

function renderizarFavoritos() {
    const contenedor = document.getElementById(
        'contenedorFavoritos'
    );

    if (!contenedor) return;

    if (!obtenerUsuarioFavoritos()) {
        contenedor.innerHTML = `
            <div class="col-12">
                <div class="alert alert-info">
                    Inicia sesión para consultar tus favoritos.
                    <a href="login.html" class="alert-link">
                        Iniciar sesión
                    </a>
                </div>
            </div>
        `;
        return;
    }

    const ids = new Set(obtenerFavoritos());

    const productos = obtenerProductos().filter(producto =>
        ids.has(String(producto.id)) &&
        producto.activo !== false
    );

    if (productos.length === 0) {
        contenedor.innerHTML = `
            <div class="col-12">
                <div class="alert alert-light border text-center">
                    No tienes favoritos disponibles.
                    <a href="productos.html">Explorar productos</a>
                </div>
            </div>
        `;
        return;
    }

    const formatoPrecio = new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP'
    });

    contenedor.innerHTML = productos.map(producto => {
        const agotado = Number(producto.stock) <= 0;

        const enlaceDetalle =
            'producto-detalle.html?id=' +
            encodeURIComponent(String(producto.id));

        return `
            <div class="col-12 col-sm-6 col-lg-3">
                <article class="card h-100 shadow-sm border-0">
                    <img
                        src="${escaparHTML(producto.img || 'img/urbana.jpg')}"
                        alt="${escaparHTML(producto.nombre)}"
                        class="card-img-top"
                        style="height:230px; object-fit:cover;"
                    >

                    <div class="card-body d-flex flex-column">
                        <h2 class="h6 fw-bold">
                            ${escaparHTML(producto.nombre)}
                        </h2>

                        <p class="text-muted small">
                            ${escaparHTML(producto.categoria || '')}
                        </p>

                        <p class="fw-bold">
                            ${formatoPrecio.format(Number(producto.precio))}
                        </p>

                        ${
                            agotado
                                ? '<span class="badge bg-danger align-self-start mb-3">Sin stock</span>'
                                : ''
                        }

                        <div class="mt-auto d-grid gap-2">
                            ${
                                agotado
                                    ? '<button type="button" class="btn btn-secondary" disabled>Sin stock disponible</button>'
                                    : `<a href="${escaparHTML(enlaceDetalle)}" class="btn btn-dark">Ver producto y elegir talla</a>`
                            }

                            <button
                                type="button"
                                class="btn btn-outline-danger btn-favorito"
                                data-id="${escaparHTML(String(producto.id))}"
                                aria-label="Quitar de favoritos"
                                aria-pressed="true"
                            >
                                <i
                                    class="bi bi-heart-fill"
                                    aria-hidden="true"
                                ></i>
                                Quitar de favoritos
                            </button>
                        </div>
                    </div>
                </article>
            </div>
        `;
    }).join('');
}