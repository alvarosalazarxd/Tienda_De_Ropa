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

});


