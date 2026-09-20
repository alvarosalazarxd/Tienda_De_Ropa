document.addEventListener('DOMContentLoaded', () => {

    
    const formRegistro = document.getElementById('formRegistro');

    if (formRegistro) {
        formRegistro.addEventListener('submit', (e) => {
            e.preventDefault(); 

            const nombreInput = document.getElementById('nombreCompleto');
            const emailInput = document.getElementById('regEmail');
            const passInput = document.getElementById('regPassword');
            const confirmPassInput = document.getElementById('confirmPassword');

            const nombre = nombreInput.value.trim();
            const email = emailInput.value.trim();
            const password = passInput.value;
            const confirmPassword = confirmPassInput.value;

            
            const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

            
            formRegistro.querySelectorAll('.form-control').forEach(input => input.classList.remove('is-invalid'));

            let esValido = true;

            if (nombre === "") {
                nombreInput.classList.add('is-invalid');
                esValido = false;
            }

            if (email === "" || !email.includes('@')) {
                emailInput.classList.add('is-invalid');
                esValido = false;
            }

            if (!passwordRegex.test(password)) {
                passInput.classList.add('is-invalid');
                esValido = false;
            }

            if (password !== confirmPassword || confirmPassword === "") {
                confirmPassInput.classList.add('is-invalid');
                esValido = false;
            }

            
            if (!esValido) {
                alert("Por favor completa los campos correctamente. La contraseña requiere 8 caracteres, una mayúscula y un número.");
                return;
            }

            
            const usuario = { nombre, email, password };
            localStorage.setItem('usuarioRegistrado', JSON.stringify(usuario));

            alert('¡Registro exitoso! Redirigiendo a Iniciar Sesión...');
            window.location.href = 'login.html';
        });
    }

    
    const formLogin = document.getElementById('formLogin');

    if (formLogin) {
        formLogin.addEventListener('submit', (e) => {
            e.preventDefault();

            const emailInput = document.getElementById('email');
            const passInput = document.getElementById('password');

            const email = emailInput.value.trim();
            const password = passInput.value;

            
            formLogin.querySelectorAll('.form-control').forEach(input => input.classList.remove('is-invalid'));

            
            if (email === "admin@admin.cl" && password === "Admin123") {
                alert('¡Bienvenido, Administrador!');
                window.location.href = 'admin.html';
                return;
            }

            
            const usuarioGuardado = JSON.parse(localStorage.getItem('usuarioRegistrado'));

            if (!usuarioGuardado) {
                alert('No hay usuarios registrados. Por favor regístrate primero.');
                window.location.href = 'registro.html';
                return;
            }

            if (email === usuarioGuardado.email && password === usuarioGuardado.password) {
                alert(`¡Bienvenido de nuevo, ${usuarioGuardado.nombre}!`);
                window.location.href = 'productos.html';
            } else {
                emailInput.classList.add('is-invalid');
                passInput.classList.add('is-invalid');
                alert('Correo o contraseña incorrectos.');
            }
        });
    }

        // === CARRITO ===
    actualizarContadorCarrito();
    renderizarCarrito();

    const btnVaciarCarrito = document.getElementById('btnVaciarCarrito');
    if (btnVaciarCarrito) btnVaciarCarrito.addEventListener('click', vaciarCarrito);

    const btnPagar = document.getElementById('btnPagar');
    if (btnPagar) {
        btnPagar.addEventListener('click', () => {
            if (obtenerCarrito().length === 0) {
                alert('Tu carrito está vacío.');
                return;
            }
            alert('¡Gracias por tu compra! (Simulación de pago)');
            guardarCarrito([]);
            renderizarCarrito();
        });
    }

});

const CARRITO_KEY = 'carritoCompras';

function obtenerCarrito() {
    return JSON.parse(localStorage.getItem(CARRITO_KEY)) || [];
}

function guardarCarrito(carrito) {
    localStorage.setItem(CARRITO_KEY, JSON.stringify(carrito));
    actualizarContadorCarrito();
}

function actualizarContadorCarrito() {
    const carrito = obtenerCarrito();
    const totalItems = carrito.reduce((total, item) => total + item.cantidad, 0);
    document.querySelectorAll('#contadorCarrito').forEach(span => {
        span.textContent = totalItems;
    });
}

function agregarAlCarrito(producto) {
    const carrito = obtenerCarrito();
    const existente = carrito.find(item => item.id === producto.id && item.talla === producto.talla);

    if (existente) {
        existente.cantidad += producto.cantidad;
    } else {
        carrito.push(producto);
    }

    guardarCarrito(carrito);
    alert(`"${producto.nombre}" se agregó al carrito.`);
}

function eliminarDelCarrito(index) {
    const carrito = obtenerCarrito();
    carrito.splice(index, 1);
    guardarCarrito(carrito);
    renderizarCarrito();
}

function cambiarCantidad(index, cambio) {
    const carrito = obtenerCarrito();
    carrito[index].cantidad += cambio;
    if (carrito[index].cantidad < 1) carrito[index].cantidad = 1;
    guardarCarrito(carrito);
    renderizarCarrito();
}

function vaciarCarrito() {
    if (confirm('¿Seguro que deseas vaciar el carrito?')) {
        guardarCarrito([]);
        renderizarCarrito();
    }
}

function renderizarCarrito() {
    const contenedor = document.getElementById('listaCarrito');
    if (!contenedor) return;

    const carrito = obtenerCarrito();
    contenedor.innerHTML = '';

    if (carrito.length === 0) {
        contenedor.innerHTML = '<tr><td colspan="5" class="text-center py-4">Tu carrito está vacío.</td></tr>';
        document.getElementById('totalCarrito').textContent = '$0';
        return;
    }

    let total = 0;

    carrito.forEach((item, index) => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;

        contenedor.innerHTML += `
            <tr>
                <td class="d-flex align-items-center gap-2">
                    <img src="${item.imagen}" alt="${item.nombre}" width="60" class="rounded">
                    <span>${item.nombre}${item.talla ? ' (' + item.talla + ')' : ''}</span>
                </td>
                <td>$${item.precio.toLocaleString('es-CL')}</td>
                <td>
                    <div class="d-flex align-items-center gap-2">
                        <button type="button" class="btn btn-sm btn-outline-secondary" onclick="cambiarCantidad(${index}, -1)">-</button>
                        <span>${item.cantidad}</span>
                        <button type="button" class="btn btn-sm btn-outline-secondary" onclick="cambiarCantidad(${index}, 1)">+</button>
                    </div>
                </td>
                <td>$${subtotal.toLocaleString('es-CL')}</td>
                <td>
                    <button type="button" class="btn btn-sm btn-outline-danger" onclick="eliminarDelCarrito(${index})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });

    document.getElementById('totalCarrito').textContent = '$' + total.toLocaleString('es-CL');
}

