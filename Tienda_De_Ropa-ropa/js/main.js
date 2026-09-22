// ==========================================
// FUNCIONES DE UTILIDAD
// ==========================================

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
    if (typeof precioRaw === 'number') return Math.max(0, Math.floor(precioRaw));
    if (!precioRaw) return 0;
    const digitos = String(precioRaw).replace(/\D/g, '');
    return parseInt(digitos, 10) || 0;
}

// ==========================================
// INICIALIZACIÓN GENERAL (DOM CONTENT LOADED)
// ==========================================

document.addEventListener('DOMContentLoaded', () => {

    // Navbar y Carrito
    actualizarNavbarUsuario();
    vincularBotonesAgregarCarrito();
    renderizarCarrito();
    actualizarContadorCarrito();
    vincularBotonVaciar();
    vincularBotonPagar();

    // Vistas Dinámicas
    renderizarCatalogoProductos();
    inicializarPanelAdminProductos();
    cargarTablaUsuarios();
    configurarEventosTablaUsuarios();
    inicializarCheckout();

    // Mostrar/Ocultar Contraseñas
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

    // Formulario de Registro
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

    // Formulario de Login
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
// MÓDULO DEL CARRITO DE COMPRAS
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
        if (textoBoton.includes('ver') || textoBoton.includes('detalle') || textoBoton.includes('comprando') || textoBoton.includes('pagar') || textoBoton.includes('vaciar') || textoBoton.includes('confirmar')) {
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
                alert('Tu carrito está vacío. Agrega productos antes de proceder al pago.');
                return;
            }
            window.location.href = 'checkout.html';
        };
    }
}

// ==========================================
// MÓDULO DE CHECKOUT (PASARELA DE PAGO)
// ==========================================

function inicializarCheckout() {
    const itemsContainer = document.getElementById('itemsCheckout');
    const totalPagoElem = document.getElementById('totalPago');
    const formCheckout = document.getElementById('formCheckout');
    const radioTarjeta = document.getElementById('tarjeta');
    const radioTransferencia = document.getElementById('transferencia');
    const camposTarjeta = document.getElementById('camposTarjeta');

    if (!itemsContainer && !formCheckout) return;

    // Conmutar campos de tarjeta de crédito
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

    // Cargar Resumen de productos en Checkout
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
                        <span class="text-muted"> x${cantidad}</span>
                    </div>
                    <span class="fw-semibold">${formatoCLP.format(subtotal)}</span>
                </div>
            `;
        });

        if (itemsContainer) itemsContainer.innerHTML = htmlItems;
        if (totalPagoElem) totalPagoElem.textContent = formatoCLP.format(totalCalculado);
    }

    // Confirmar pago y vaciar carrito
    if (formCheckout) {
        formCheckout.addEventListener('submit', (e) => {
            e.preventDefault();

            if (carrito.length === 0) {
                alert('No hay productos en el pedido.');
                return;
            }

            alert('¡Pago procesado con éxito! Gracias por tu compra en Moda & Estilo.');

            localStorage.removeItem(CARRITO_KEY);
            localStorage.removeItem('carritoCompras');

            window.location.href = 'index.html';
        });
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
// BASE DE DATOS Y CATÁLOGO DE PRODUCTOS
// ==========================================

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
        tallas: ["S - Small", "M - Medium", "L - Large", "XL - Extra Large"],
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
    return obtenerProductos().find(p => Number(p.id) === Number(id));
}

function agregarProducto(producto) {
    const productos = obtenerProductos();
    productos.push(producto);
    guardarProductos(productos);
}

function actualizarProducto(productoActualizado) {
    const productos = obtenerProductos();
    const index = productos.findIndex(p => Number(p.id) === Number(productoActualizado.id));
    if (index !== -1) {
        productos[index] = productoActualizado;
        guardarProductos(productos);
    }
}

function eliminarProducto(id) {
    const productos = obtenerProductos().filter(p => Number(p.id) !== Number(id));
    guardarProductos(productos);
}

function calcularEstadoStock(stock) {
    if (stock === 0) return { texto: 'Agotado', clase: 'bg-danger' };
    if (stock <= 5) return { texto: 'Poco Stock', clase: 'bg-warning text-dark' };
    return { texto: 'Disponible', clase: 'bg-success' };
}

// Renderiza los productos dinámicamente en productos.html (si existe el contenedor)
function renderizarCatalogoProductos() {
    const catalogo = document.getElementById('contenedorProductos');
    if (!catalogo) return;

    const productos = obtenerProductos();
    const formatoCLP = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' });

    catalogo.innerHTML = '';

    productos.forEach(p => {
        const opcionesTallas = (p.tallas || ['Única']).map(t => `<option value="${escaparHTML(t)}">${escaparHTML(t)}</option>`).join('');

        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-3 mb-4';
        col.innerHTML = `
            <div class="card h-100 border-0 shadow-sm tarjeta-producto">
                <img src="${escaparHTML(p.img)}" class="card-img-top" alt="${escaparHTML(p.nombre)}" style="height: 250px; object-fit: cover;">
                <div class="card-body d-flex flex-column">
                    <span class="badge bg-secondary mb-2 align-self-start">${escaparHTML(p.categoria)}</span>
                    <h5 class="card-title fw-bold">${escaparHTML(p.nombre)}</h5>
                    <p class="card-text text-muted small flex-grow-1">${escaparHTML(p.desc || '')}</p>
                    <div class="mb-3">
                        <label class="form-label small text-muted">Talla:</label>
                        <select class="form-select form-select-sm">${opcionesTallas}</select>
                    </div>
                    <div class="d-flex justify-content-between align-items-center mt-auto">
                        <span class="fs-5 fw-bold text-dark">${formatoCLP.format(p.precio)}</span>
                        <button class="btn btn-dark btn-sm btn-agregar-carrito" data-id="${p.id}" data-nombre="${escaparHTML(p.nombre)}" data-precio="${p.precio}" data-imagen="${escaparHTML(p.img)}">
                            <i class="bi bi-cart-plus me-1"></i> Agregar
                        </button>
                    </div>
                </div>
            </div>
        `;
        catalogo.appendChild(col);
    });
}

// ==========================================
// PANEL ADMIN — GESTIÓN DE PRODUCTOS
// ==========================================

function inicializarPanelAdminProductos() {
    const tbody = document.getElementById('tablaAdminProductos');
    if (!tbody) return;

    const modalEl = document.getElementById('modalProducto');
    const modalProducto = modalEl ? new bootstrap.Modal(modalEl) : null;
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
                <td><span class="badge ${estado.clase}">${estado.texto}</span></td>
                <td class="text-center">
                    <button type="button" class="btn btn-sm btn-outline-secondary me-1 btn-editar-producto" data-id="${p.id}" title="Editar"><i class="bi bi-pencil-square"></i></button>
                    <button type="button" class="btn btn-sm btn-outline-danger btn-eliminar-producto" data-id="${p.id}" title="Eliminar"><i class="bi bi-trash"></i></button>
                </td>
            `;
            tbody.appendChild(fila);
        });

        const dashStock = document.getElementById('dashTotalStock');
        const dashAlertas = document.getElementById('dashAlertas');
        if (dashStock) dashStock.textContent = `${totalStock} prendas`;
        if (dashAlertas) dashAlertas.textContent = `${alertas} ítems bajos`;
    }

    function abrirModalAgregar() {
        form.reset();
        inputIdEditar.value = '';
        tituloModal.textContent = 'Agregar Producto';
        if (modalProducto) modalProducto.show();
    }

    function abrirModalEditar(id) {
        const p = obtenerProductoPorId(id);
        if (!p) return;

        inputIdEditar.value = p.id;
        document.getElementById('prodNombre').value = p.nombre;
        document.getElementById('prodCategoria').value = p.categoria;
        document.getElementById('prodPrecio').value = p.precio;
        document.getElementById('prodStock').value = p.stock;
        document.getElementById('prodImagen').value = p.img;
        document.getElementById('prodDescripcion').value = p.desc || '';
        document.getElementById('prodTallas').value = (p.tallas || []).join(', ');

        tituloModal.textContent = 'Editar Producto';
        if (modalProducto) modalProducto.show();
    }

    const btnAbrir = document.getElementById('btnAbrirModalAgregar');
    if (btnAbrir) btnAbrir.addEventListener('click', abrirModalAgregar);

    tbody.addEventListener('click', (e) => {
        const btnEditar = e.target.closest('.btn-editar-producto');
        const btnEliminar = e.target.closest('.btn-eliminar-producto');

        if (btnEditar) {
            abrirModalEditar(btnEditar.dataset.id);
        }

        if (btnEliminar) {
            const p = obtenerProductoPorId(btnEliminar.dataset.id);
            const nombre = p ? p.nombre : 'este producto';
            if (confirm(`¿Estás seguro de que deseas eliminar "${nombre}"?`)) {
                eliminarProducto(btnEliminar.dataset.id);
                renderTablaAdmin();
            }
        }
    });

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const idEditando = inputIdEditar.value;
            const categoria = document.getElementById('prodCategoria').value;
            const tallas = document.getElementById('prodTallas').value
                .split(',')
                .map(t => t.trim())
                .filter(t => t !== '');

            const producto = {
                id: idEditando ? Number(idEditando) : Date.now(),
                nombre: document.getElementById('prodNombre').value.trim(),
                categoria: categoria,
                categoriaSlug: mapaCategoriaSlug[categoria] || 'urbano',
                precio: parsearPrecio(document.getElementById('prodPrecio').value),
                stock: parseInt(document.getElementById('prodStock').value, 10) || 0,
                img: document.getElementById('prodImagen').value.trim() || 'img/urbana.jpg',
                desc: document.getElementById('prodDescripcion').value.trim(),
                tallas: tallas.length ? tallas : ['Talla Única']
            };

            if (idEditando) {
                actualizarProducto(producto);
            } else {
                agregarProducto(producto);
            }

            if (modalProducto) modalProducto.hide();
            renderTablaAdmin();
        });
    }

    renderTablaAdmin();
}

// ==========================================
// PANEL ADMIN — GESTIÓN DE USUARIOS
// ==========================================

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