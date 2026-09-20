document.addEventListener('DOMContentLoaded', () => {

    // LÓGICA MOSTRAR / OCULTAR CONTRASEÑA (OJO)
    document.querySelectorAll('.btn-toggle-password').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Busca el input de tipo password dentro del mismo grupo
            const inputGroup = btn.closest('.input-group');
            const input = inputGroup.querySelector('input');
            const icon = btn.querySelector('i');

            if (input) {
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.classList.remove('bi-eye-slash-fill');
                    icon.classList.add('bi-eye-fill');
                } else {
                    input.type = 'password';
                    icon.classList.remove('bi-eye-fill');
                    icon.classList.add('bi-eye-slash-fill');
                }
            }
        });
    });

    // VALIDACIÓN DE REGISTRO
    const formRegistro = document.getElementById('formRegistro');

    if (formRegistro) {
        formRegistro.addEventListener('submit', (e) => {
            e.preventDefault();

            const nombresInput = document.getElementById('regNombres');
            const apellidosInput = document.getElementById('regApellidos');
            const emailInput = document.getElementById('regEmail');
            const passInput = document.getElementById('regPassword');
            const confirmPassInput = document.getElementById('confirmPassword');
            const alerta = document.getElementById('alertaRegistro');

            const nombres = nombresInput ? nombresInput.value.trim() : '';
            const apellidos = apellidosInput ? apellidosInput.value.trim() : '';
            const email = emailInput ? emailInput.value.trim().toLowerCase() : '';
            const password = passInput ? passInput.value : '';
            const confirmPassword = confirmPassInput ? confirmPassInput.value : '';

            const mostrarAlerta = (mensaje, tipo = 'danger') => {
                if (alerta) {
                    alerta.className = `alert alert-${tipo} mb-4`;
                    alerta.textContent = mensaje;
                    alerta.classList.remove('d-none');
                } else {
                    alert(mensaje);
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

            const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
            if (!passwordRegex.test(password)) {
                mostrarAlerta('La contraseña requiere al menos 8 caracteres, una mayúscula y un número.');
                return;
            }

            let usuarios = JSON.parse(localStorage.getItem('usuarios_registrados')) || [];

            const usuarioExistente = usuarios.find(u => u.email === email);
            if (usuarioExistente) {
                mostrarAlerta('El correo electrónico ya se encuentra registrado. Intenta con otro.');
                return;
            }

            const passwordExistente = usuarios.find(u => u.password === password);
            if (passwordExistente) {
                mostrarAlerta('La contraseña ingresada ya está en uso. Por seguridad, utiliza otra contraseña.');
                return;
            }

            usuarios.push({
                nombres,
                apellidos,
                email,
                password
            });

            localStorage.setItem('usuarios_registrados', JSON.stringify(usuarios));

            mostrarAlerta('¡Cuenta creada con éxito! Redirigiendo a inicio de sesión...', 'success');

            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        });
    }

    // VALIDACIÓN DE INICIO DE SESIÓN
    const formLogin = document.getElementById('formLogin');

    if (formLogin) {
        formLogin.addEventListener('submit', (e) => {
            e.preventDefault();

            const emailInput = document.getElementById('email');
            const passInput = document.getElementById('password');

            const email = emailInput ? emailInput.value.trim().toLowerCase() : '';
            const password = passInput ? passInput.value : '';

            if (email === 'admin@modaestilo.cl' && password === 'admin123') {
                alert('¡Bienvenido Administrador!');
                window.location.href = 'admin.html';
                return;
            }

            const usuarios = JSON.parse(localStorage.getItem('usuarios_registrados')) || [];
            const usuarioEncontrado = usuarios.find(u => u.email === email && u.password === password);

            if (usuarioEncontrado) {
                alert(`¡Bienvenido de nuevo, ${usuarioEncontrado.nombres}!`);
                window.location.href = 'productos.html';
            } else {
                if (emailInput) emailInput.classList.add('is-invalid');
                if (passInput) passInput.classList.add('is-invalid');
                alert('Correo o contraseña incorrectos.');
            }
        });
    }

    // CARRITO DE COMPRAS
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
        const totalElem = document.getElementById('totalCarrito');
        if (totalElem) totalElem.textContent = '$0';
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

    const totalElem = document.getElementById('totalCarrito');
    if (totalElem) totalElem.textContent = '$' + total.toLocaleString('es-CL');
}