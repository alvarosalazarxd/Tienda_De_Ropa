// ==========================================
// FUNCIONES DE UTILIDAD
// ==========================================

/**
 * Escapa caracteres especiales de HTML para prevenir ataques XSS.
 */
function escaparHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * Normaliza y convierte textos de precio (ej: "$19.990" o "19990") a Number entero.
 */
function parsearPrecio(precioRaw) {
    if (typeof precioRaw === 'number') return Math.max(0, Math.floor(precioRaw));
    if (!precioRaw) return 0;
    const digitos = String(precioRaw).replace(/\D/g, '');
    return parseInt(digitos, 10) || 0;
}


// ==========================================
// INICIALIZACIÓN DE LA APLICACIÓN
// ==========================================

document.addEventListener('DOMContentLoaded', () => {

    // 1. Navbar y Estado de Sesión
    actualizarNavbarUsuario();

    // 2. Carrito de Compras
    vincularBotonesAgregarCarrito();
    renderizarCarrito();
    actualizarContadorCarrito();
    vincularBotonVaciar();
    vincularBotonPagar();

    // 3. Panel Administrador (Productos)
    const tbodyProductos = document.querySelector('#tablaAdminProductos tbody') || document.querySelector('#tablaAdminProductos');
    if (tbodyProductos) {
        tbodyProductos.querySelectorAll('tr').forEach(fila => {
            asignarAccionesFila(fila);
        });
    }

    const btnAgregar = document.getElementById('btnAbrirModalAgregar') || document.querySelector('.card-header button');
    if (btnAgregar && btnAgregar.textContent.includes('Agregar')) {
        btnAgregar.addEventListener('click', (e) => {
            e.preventDefault();

            const nombre = prompt('Nombre del nuevo producto:');
            if (!nombre || !nombre.trim()) return;

            const categoria = prompt('Categoría (Urbana, Casual, Formal, Accesorios):', 'Ropa Urbana');
            const precio = prompt('Precio unitario ($):', '29990');
            const stock = prompt('Cantidad en stock:', '10');

            const tbody = document.querySelector('#tablaAdminProductos tbody') || document.getElementById('tablaAdminProductos') || document.querySelector('table tbody');
            if (tbody) {
                const numFilas = tbody.querySelectorAll('tr').length + 1;
                const idProd = `#00${numFilas}`;
                const numStock = parseInt(stock, 10) || 0;
                const precioNum = parsearPrecio(precio);

                let badgeEstado = '<span class="badge bg-success">Disponible</span>';
                if (numStock === 0) {
                    badgeEstado = '<span class="badge bg-danger">Agotado</span>';
                } else if (numStock <= 5) {
                    badgeEstado = '<span class="badge bg-warning text-dark">Poco Stock</span>';
                }

                const nuevaFila = document.createElement('tr');
                nuevaFila.innerHTML = `
                    <td>${escaparHTML(idProd)}</td>
                    <td class="fw-bold">${escaparHTML(nombre.trim())}</td>
                    <td>${escaparHTML(categoria ? categoria.trim() : 'Ropa Urbana')}</td>
                    <td>$${precioNum.toLocaleString('es-CL')}</td>
                    <td>${numStock} unidades</td>
                    <td>${badgeEstado}</td>
                    <td class="text-center">
                        <button type="button" class="btn btn-sm btn-outline-secondary me-1" title="Editar"><i class="bi bi-pencil-square"></i></button>
                        <button type="button" class="btn btn-sm btn-outline-danger" title="Eliminar"><i class="bi bi-trash"></i></button>
                    </td>
                `;

                tbody.appendChild(nuevaFila);
                asignarAccionesFila(nuevaFila);
                actualizarMetricasAdmin();
            }
        });
    }

    actualizarMetricasAdmin();

    // 4. Panel Administrador (Usuarios)
    cargarTablaUsuarios();
    configurarEventosTablaUsuarios();

    // 5. Toggle de Visibilidad de Contraseñas
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

    // 6. Formulario de Registro
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
                    alert(msg);
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
            setTimeout(() => window.location.href = 'login.html', 1500);
        });
    }

    // 7. Formulario de Login
    const formLogin = document.getElementById('formLogin');
    if (formLogin) {
        formLogin.addEventListener('submit', (e) => {
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
                alert('¡Bienvenido Administrador!');
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
                alert(`¡Bienvenido de nuevo, ${user.nombres}!`);
                window.location.href = 'productos.html';
            } else {
                alert('Correo o contraseña incorrectos.');
            }
        });
    }
});


// ==========================================
// GESTIÓN DEL CARRITO DE COMPRAS
// ==========================================

const CARRITO_KEY = 'carrito_moda_estilo';

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
        const btn = e.target.closest('.btn-agregar-carrito, [data-agregar-carrito], .card-body .btn-dark, .card-body .btn-primary, .tarjeta-producto .btn');

        if (!btn) return;

        const textoBoton = btn.textContent.trim().toLowerCase();
        if (textoBoton.includes('ver') || textoBoton.includes('detalle') || textoBoton.includes('comprando') || textoBoton.includes('pagar') || textoBoton.includes('vaciar')) {
            return;
        }

        e.preventDefault();

        let id = btn.getAttribute('data-id') || btn.dataset.id;
        let nombre = btn.dataset.nombre || btn.getAttribute('data-nombre');
        let precio = btn.dataset.precio || btn.getAttribute('data-precio');
        let imagen = btn.dataset.imagen || btn.getAttribute('data-imagen');
        let talla = btn.dataset.talla || btn.getAttribute('data-talla') || '';

        const tarjeta = btn.closest('.card') || btn.closest('.tarjeta-producto') || btn.closest('.col') || btn.closest('.producto-item');

        if (tarjeta) {
            if (!nombre) {
                const nombreElem = tarjeta.querySelector('.card-title, h5, h6, .titulo-producto, .nombre-producto');
                nombre = nombreElem ? nombreElem.textContent.trim() : 'Producto';
            }

            if (!precio) {
                const tarjetaClon = tarjeta.cloneNode(true);
                tarjetaClon.querySelectorAll('del, s, .text-decoration-line-through, .precio-anterior, .text-muted').forEach(el => el.remove());

                const precioElem = tarjetaClon.querySelector('.text-gold, .fw-bold, .precio, .card-text, .price') || tarjetaClon;
                precio = precioElem ? precioElem.textContent : '0';
            }

            if (!imagen) {
                const imgElem = tarjeta.querySelector('img');
                imagen = imgElem ? (imgElem.getAttribute('src') || imgElem.src) : 'img/urbana.jpg';
            }

            if (!talla) {
                const selectTalla = tarjeta.querySelector('select');
                talla = selectTalla ? selectTalla.value : '';
            }
        }

        const precioNumero = parsearPrecio(precio);

        agregarAlCarrito(nombre, precioNumero, imagen, talla, id);

        const textoOriginal = btn.innerHTML;
        btn.innerHTML = '<i class="bi bi-check-circle me-1"></i> ¡Agregado!';
        btn.classList.add('btn-success');

        setTimeout(() => {
            btn.innerHTML = textoOriginal;
            btn.classList.remove('btn-success');
        }, 1200);
    });
}

function agregarAlCarrito(nombre, precio, imagen = '', talla = '', id = null) {
    const nombreLimpio = (typeof nombre === 'string' && !nombre.includes('[object')) ? nombre.trim() : 'Producto';
    const precioLimpio = parsearPrecio(precio);
    const imagenLimpia = (typeof imagen === 'string' && !imagen.includes('[object')) ? imagen : 'img/urbana.jpg';
    const tallaLimpia = typeof talla === 'string' ? talla.trim() : '';

    let carrito = obtenerCarrito();

    const indice = carrito.findIndex(item => 
        (id && item.id == id) || (item.nombre === nombreLimpio && item.talla === tallaLimpia)
    );

    if (indice !== -1) {
        carrito[indice].cantidad = (parseInt(carrito[indice].cantidad, 10) || 0) + 1;
        if (precioLimpio > 0) carrito[indice].precio = precioLimpio;
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

    // Eventos para cambiar cantidad desde el input numérico
    contenedor.querySelectorAll('.cantidad-item').forEach(input => {
        input.addEventListener('change', (e) => {
            const idx = parseInt(e.target.getAttribute('data-index'), 10);
            const nuevaCant = parseInt(e.target.value, 10);
            let cart = obtenerCarrito();

            if (nuevaCant >= 1 && cart[idx]) {
                cart[idx].cantidad = nuevaCant;
                guardarCarrito(cart);
                renderizarCarrito();
            }
        });
    });

    // Eventos para eliminar ítem del carrito
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
        btnVaciar.onclick = () => {
            const carrito = obtenerCarrito();
            if (carrito.length === 0) return;

            if (confirm('¿Estás seguro de que deseas vaciar el carrito?')) {
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
                alert('Tu carrito está vacío. Agrega productos antes de realizar el pago.');
                return;
            }

            const total = document.getElementById('totalCarrito')?.textContent || '$0';
            if (confirm(`¿Confirmar compra por un total de ${total}?`)) {
                alert('¡Gracias por tu compra! Tu pedido ha sido procesado exitosamente.');
                localStorage.removeItem(CARRITO_KEY);
                localStorage.removeItem('carritoCompras');
                renderizarCarrito();
                actualizarContadorCarrito();
            }
        };
    }
}


// ==========================================
// CONTROL DE SESIÓN Y NAVBAR
// ==========================================

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
                <i class="bi bi-person-circle me-1"></i> ${escaparHTML(usuarioActivo.nombres)} ${escaparHTML(usuarioActivo.apellidos || '')}
            </a>
            <ul class="dropdown-menu dropdown-menu-end bg-dark border-secondary" aria-labelledby="userDropdown">
                ${usuarioActivo.rol === 'Administrador' ? '<li><a class="dropdown-item text-light" href="admin.html"><i class="bi bi-speedometer2 me-2"></i>Panel Admin</a></li><li><hr class="dropdown-divider border-secondary"></li>' : ''}
                <li>
                    <a class="dropdown-item text-danger fw-semibold" href="#" id="btnCerrarSesion">
                        <i class="bi bi-box-arrow-right me-2"></i>Cerrar Sesión
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

function cerrarSesion(e) {
    if (e) e.preventDefault();
    localStorage.removeItem('usuario_activo');
    alert('Has cerrado sesión correctamente.');
    window.location.href = 'index.html';
}


// ==========================================
// FUNCIONES ADMIN (PRODUCTOS Y USUARIOS)
// ==========================================

function asignarAccionesFila(fila) {
    const celdas = fila.querySelectorAll('td');
    if (celdas.length < 6) return;

    const btnEditar = fila.querySelector('button:first-of-type, .btn-outline-secondary, .btn-outline-dark');
    if (btnEditar) {
        btnEditar.addEventListener('click', () => {
            const nombreActual = celdas[1].textContent.trim();
            const stockTexto = celdas[4].textContent.trim();
            const stockActual = parseInt(stockTexto, 10) || 0;

            const nuevoNombre = prompt('Editar nombre del producto:', nombreActual);
            if (nuevoNombre === null || !nuevoNombre.trim()) return;

            const nuevoStockStr = prompt('Editar stock (unidades):', stockActual);
            if (nuevoStockStr === null) return;

            const nuevoStock = parseInt(nuevoStockStr, 10) || 0;

            celdas[1].textContent = nuevoNombre.trim();
            celdas[4].textContent = `${nuevoStock} unidades`;

            if (nuevoStock === 0) {
                celdas[5].innerHTML = '<span class="badge bg-danger">Agotado</span>';
            } else if (nuevoStock <= 5) {
                celdas[5].innerHTML = '<span class="badge bg-warning text-dark">Poco Stock</span>';
            } else {
                celdas[5].innerHTML = '<span class="badge bg-success">Disponible</span>';
            }

            actualizarMetricasAdmin();
        });
    }

    const btnEliminar = fila.querySelector('button:last-of-type, .btn-outline-danger');
    if (btnEliminar) {
        btnEliminar.addEventListener('click', () => {
            const nombreProd = celdas[1].textContent.trim();
            if (confirm(`¿Estás seguro de que deseas eliminar "${nombreProd}"?`)) {
                fila.remove();
                actualizarMetricasAdmin();
            }
        });
    }
}

function actualizarMetricasAdmin() {
    let totalStock = 0;
    let alertasCount = 0;

    const tablaProductos = document.querySelector('#tablaAdminProductos tbody') || document.querySelector('#tablaAdminProductos');
    if (!tablaProductos) return;

    tablaProductos.querySelectorAll('tr').forEach(fila => {
        const celdas = fila.querySelectorAll('td');
        if (celdas.length >= 5) {
            const cant = parseInt(celdas[4].textContent, 10) || 0;
            totalStock += cant;
            if (cant <= 5) alertasCount++;
        }
    });

    const dashStock = document.getElementById('dashTotalStock');
    const dashAlertas = document.getElementById('dashAlertas');

    if (dashStock) dashStock.textContent = `${totalStock} prendas`;
    if (dashAlertas) dashAlertas.textContent = `${alertasCount} ítems bajos`;
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

    if (badgeTotal) {
        badgeTotal.textContent = `${usuarios.length} registrados`;
    }

    tablaUsuarios.innerHTML = '';

    usuarios.forEach((u, index) => {
        const esAdmin = u.rol === 'Administrador' || u.email === 'admin@modaestilo.cl';
        const badgeRol = esAdmin 
            ? '<span class="badge bg-dark">Administrador</span>' 
            : '<span class="badge bg-secondary">Cliente</span>';

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

function eliminarUsuario(index) {
    let usuarios = [];
    try {
        usuarios = JSON.parse(localStorage.getItem('usuarios_registrados')) || [];
    } catch (e) {
        usuarios = [];
    }

    const user = usuarios[index];
    const nombre = user ? `${user.nombres} ${user.apellidos}`.trim() : 'este usuario';

    if (confirm(`¿Estás seguro de que deseas eliminar a ${nombre}?`)) {
        usuarios.splice(index, 1);
        localStorage.setItem('usuarios_registrados', JSON.stringify(usuarios));
        cargarTablaUsuarios();
    }
}