document.addEventListener('DOMContentLoaded', () => {

    // === 1. REGISTRO DE USUARIOS ===
    const formRegistro = document.getElementById('formRegistro');

    if (formRegistro) {
        formRegistro.addEventListener('submit', (e) => {
            e.preventDefault(); // Evita la recarga automática de la página

            const nombreInput = document.getElementById('nombreCompleto');
            const emailInput = document.getElementById('regEmail');
            const passInput = document.getElementById('regPassword');
            const confirmPassInput = document.getElementById('confirmPassword');

            const nombre = nombreInput.value.trim();
            const email = emailInput.value.trim();
            const password = passInput.value;
            const confirmPassword = confirmPassInput.value;

            // Requisito: Mínimo 8 caracteres, 1 mayúscula y 1 número
            const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

            // Limpiar errores visuales previos
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

            // Si falla alguna regla, detiene la ejecución
            if (!esValido) {
                alert("Por favor completa los campos correctamente. La contraseña requiere 8 caracteres, una mayúscula y un número.");
                return;
            }

            // Guardar usuario en localStorage
            const usuario = { nombre, email, password };
            localStorage.setItem('usuarioRegistrado', JSON.stringify(usuario));

            alert('¡Registro exitoso! Redirigiendo a Iniciar Sesión...');
            window.location.href = 'login.html';
        });
    }

    // === 2. INICIO DE SESIÓN CON CONTROL DE ROLES ===
    const formLogin = document.getElementById('formLogin');

    if (formLogin) {
        formLogin.addEventListener('submit', (e) => {
            e.preventDefault();

            const emailInput = document.getElementById('email');
            const passInput = document.getElementById('password');

            const email = emailInput.value.trim();
            const password = passInput.value;

            // Limpiar errores previos
            formLogin.querySelectorAll('.form-control').forEach(input => input.classList.remove('is-invalid'));

            // CREDENCIALES DE ADMINISTRADOR
            if (email === "admin@admin.cl" && password === "Admin123") {
                alert('¡Bienvenido, Administrador!');
                window.location.href = 'admin.html';
                return;
            }

            // CREDENCIALES DE CLIENTE REGISTRADO
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
});