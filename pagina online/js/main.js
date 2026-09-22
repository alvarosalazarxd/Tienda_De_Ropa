document.addEventListener('DOMContentLoaded', () => {

    /* =========================================================
       REGISTRO DE USUARIO
    ========================================================= */

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

            formRegistro.querySelectorAll('.form-control').forEach(input => {
                input.classList.remove('is-invalid');
            });

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

                alert(
                    "Por favor completa los campos correctamente. " +
                    "La contraseña requiere 8 caracteres, una mayúscula y un número."
                );

                return;
            }

            const usuario = {
                nombre,
                email,
                password
            };

            localStorage.setItem(
                'usuarioRegistrado',
                JSON.stringify(usuario)
            );

            alert('¡Registro exitoso! Redirigiendo a Iniciar Sesión...');

            window.location.href = 'login.html';

        });

    }


    /* =========================================================
       LOGIN
    ========================================================= */

    const formLogin = document.getElementById('formLogin');

    if (formLogin) {

        formLogin.addEventListener('submit', (e) => {

            e.preventDefault();

            const emailInput = document.getElementById('email');
            const passInput = document.getElementById('password');

            const email = emailInput.value.trim();
            const password = passInput.value;

            formLogin.querySelectorAll('.form-control').forEach(input => {
                input.classList.remove('is-invalid');
            });


            /* LOGIN ADMINISTRADOR */

            if (email === "admin@admin.cl" && password === "Admin123") {

                alert('¡Bienvenido, Administrador!');

                window.location.href = 'admin.html';

                return;
            }


            /* USUARIO REGISTRADO */

            const usuarioGuardado = JSON.parse(
                localStorage.getItem('usuarioRegistrado')
            );


            if (!usuarioGuardado) {

                alert(
                    'No hay usuarios registrados. Por favor regístrate primero.'
                );

                window.location.href = 'registro.html';

                return;
            }


            if (
                email === usuarioGuardado.email &&
                password === usuarioGuardado.password
            ) {

                alert(
                    `¡Bienvenido de nuevo, ${usuarioGuardado.nombre}!`
                );

                window.location.href = 'productos.html';

            } else {

                emailInput.classList.add('is-invalid');
                passInput.classList.add('is-invalid');

                alert('Correo o contraseña incorrectos.');

            }

        });

    }


    /* =========================================================
       CARRITO DE COMPRAS
       Se guarda en localStorage para compartirlo entre páginas.
    ========================================================= */

    let carrito = JSON.parse(
        localStorage.getItem('carrito')
    ) || [];


    /* =========================================================
       GUARDAR CARRITO
    ========================================================= */

    function guardarCarrito() {

        localStorage.setItem(
            'carrito',
            JSON.stringify(carrito)
        );

    }


    /* =========================================================
       ACTUALIZAR CARRITO
    ========================================================= */

    function actualizarCarrito() {

        const listaCarrito = document.getElementById('listaCarrito');
        const contadorCarrito = document.getElementById('contadorCarrito');
        const totalCarrito = document.getElementById('totalCarrito');


        /*
         * Si estamos en una página que no tiene carrito,
         * simplemente no hacemos nada.
         */

        if (!listaCarrito || !contadorCarrito || !totalCarrito) {
            return;
        }


        /* Limpiar lista */

        listaCarrito.innerHTML = '';


        /* Si el carrito está vacío */

        if (carrito.length === 0) {

            listaCarrito.innerHTML = `
                <div id="carritoVacio" class="text-center text-muted mt-5">

                    <i class="bi bi-cart-x fs-1"></i>

                    <p class="mt-3">
                        Tu carrito está vacío.
                    </p>

                </div>
            `;

            contadorCarrito.textContent = '0';
            totalCarrito.textContent = '$0';

            return;
        }


        /* =====================================================
           MOSTRAR PRODUCTOS
        ===================================================== */

        let total = 0;
        let cantidadTotal = 0;


        carrito.forEach((producto, index) => {

            const subtotal =
                producto.precio * producto.cantidad;

            total += subtotal;
            cantidadTotal += producto.cantidad;


            const productoHTML = document.createElement('div');

            productoHTML.className =
                'carrito-producto border-bottom pb-3 mb-3';


            productoHTML.innerHTML = `

                <div class="d-flex gap-3">

                    <img
                        src="${producto.imagen}"
                        alt="${producto.nombre}"
                        class="carrito-imagen"
                    >

                    <div class="flex-grow-1">

                        <div class="d-flex justify-content-between align-items-start">

                            <h6 class="fw-bold mb-1">
                                ${producto.nombre}
                            </h6>

                            <button
                                type="button"
                                class="btn btn-sm btn-outline-danger eliminar-producto"
                                data-index="${index}"
                                title="Eliminar producto"
                            >
                                <i class="bi bi-trash"></i>
                            </button>

                        </div>


                        <p class="text-muted small mb-1">
                            $${producto.precio.toLocaleString('es-CL')} c/u
                        </p>


                        <p class="text-muted small mb-2">
                            <strong>Talla:</strong>
                            ${producto.talla || 'No especificada'}
                        </p>


                        <div class="d-flex justify-content-between align-items-center">

                            <div class="btn-group" role="group">

                                <button
                                    type="button"
                                    class="btn btn-sm btn-outline-secondary disminuir-cantidad"
                                    data-index="${index}"
                                >
                                    <i class="bi bi-dash"></i>
                                </button>


                                <span class="btn btn-sm btn-light disabled">
                                    ${producto.cantidad}
                                </span>


                                <button
                                    type="button"
                                    class="btn btn-sm btn-outline-secondary aumentar-cantidad"
                                    data-index="${index}"
                                >
                                    <i class="bi bi-plus"></i>
                                </button>

                            </div>


                            <strong class="text-warning">
                                $${subtotal.toLocaleString('es-CL')}
                            </strong>

                        </div>

                    </div>

                </div>
            `;


            listaCarrito.appendChild(productoHTML);

        });


        /* =====================================================
           ACTUALIZAR TOTAL Y CONTADOR
        ===================================================== */

        contadorCarrito.textContent = cantidadTotal;

        totalCarrito.textContent =
            `$${total.toLocaleString('es-CL')}`;


        /* =====================================================
           BOTONES AUMENTAR CANTIDAD
        ===================================================== */

        document.querySelectorAll('.aumentar-cantidad').forEach(button => {

            button.addEventListener('click', () => {

                const index = parseInt(
                    button.dataset.index
                );

                carrito[index].cantidad++;

                guardarCarrito();
                actualizarCarrito();

            });

        });


        /* =====================================================
           BOTONES DISMINUIR CANTIDAD
        ===================================================== */

        document.querySelectorAll('.disminuir-cantidad').forEach(button => {

            button.addEventListener('click', () => {

                const index = parseInt(
                    button.dataset.index
                );


                if (carrito[index].cantidad > 1) {

                    carrito[index].cantidad--;

                } else {

                    carrito.splice(index, 1);

                }


                guardarCarrito();
                actualizarCarrito();

            });

        });


        /* =====================================================
           BOTONES ELIMINAR
        ===================================================== */

        document.querySelectorAll('.eliminar-producto').forEach(button => {

            button.addEventListener('click', () => {

                const index = parseInt(
                    button.dataset.index
                );

                carrito.splice(index, 1);

                guardarCarrito();
                actualizarCarrito();

            });

        });

    }


    /* =========================================================
       AGREGAR PRODUCTO AL CARRITO
    ========================================================= */

    function agregarAlCarrito(producto) {

        const productoExistente = carrito.find(
            item =>
                item.id === producto.id &&
                item.talla === producto.talla
        );


        if (productoExistente) {

            productoExistente.cantidad += producto.cantidad;

        } else {

            carrito.push({
                id: producto.id,
                nombre: producto.nombre,
                precio: producto.precio,
                imagen: producto.imagen,
                talla: producto.talla,
                cantidad: producto.cantidad
            });

        }


        guardarCarrito();
        actualizarCarrito();


        alert(
            `${producto.nombre} se agregó al carrito.`
        );

    }


    /* =========================================================
       BOTONES "AGREGAR AL CARRITO"
    ========================================================= */

    document.querySelectorAll('.agregar-carrito').forEach(button => {

        button.addEventListener('click', () => {

            const urlParams =
                new URLSearchParams(window.location.search);

            const prodId =
                urlParams.get('id') || '1';


            const productoActual =
                productos[prodId];


            if (!productoActual) {

                alert('No se pudo encontrar el producto.');

                return;
            }


            const tallaSelect =
                document.getElementById('tallaSelect');

            const cantidadInput =
                document.getElementById('cantidadInput');


            const talla =
                tallaSelect ? tallaSelect.value : '';


            const cantidad =
                cantidadInput
                    ? parseInt(cantidadInput.value)
                    : 1;


            if (
                cantidad < 1 ||
                cantidad > 10 ||
                isNaN(cantidad)
            ) {

                alert(
                    'La cantidad debe estar entre 1 y 10.'
                );

                return;
            }


            const producto = {

                id:
                    productoActual.id ||
                    prodId,

                nombre:
                    productoActual.nombre,

                precio:
                    parseInt(
                        productoActual.precio.replace(/\D/g, '')
                    ),

                imagen:
                    productoActual.img,

                talla:
                    talla,

                cantidad:
                    cantidad

            };


            agregarAlCarrito(producto);

        });

    });


    /* =========================================================
       BOTÓN VACIAR CARRITO
    ========================================================= */

    const btnVaciar =
        document.getElementById('btnVaciar');


    if (btnVaciar) {

        btnVaciar.addEventListener('click', () => {

            if (carrito.length === 0) {
                return;
            }


            const confirmar =
                confirm(
                    '¿Estás seguro de que quieres vaciar el carrito?'
                );


            if (confirmar) {

                carrito = [];

                guardarCarrito();
                actualizarCarrito();

            }

        });

    }


    /* =========================================================
       FINALIZAR COMPRA
    ========================================================= */

    const btnComprar =
        document.getElementById('btnComprar');


    if (btnComprar) {

        btnComprar.addEventListener('click', () => {

            if (carrito.length === 0) {

                alert(
                    'Tu carrito está vacío.'
                );

                return;
            }


            window.location.href =
                'checkout.html';

        });

    }


    /* =========================================================
       CHECKOUT
    ========================================================= */

    const resumenPedido =
        document.getElementById('resumenPedido');

    const totalCheckout =
        document.getElementById('totalCheckout');


    if (resumenPedido && totalCheckout) {

        const carritoCheckout =
            JSON.parse(
                localStorage.getItem('carrito')
            ) || [];


        let total = 0;


        if (carritoCheckout.length === 0) {

            resumenPedido.innerHTML = `

                <div class="alert alert-warning">

                    <i class="bi bi-cart-x"></i>

                    Tu carrito está vacío.

                </div>


                <a
                    href="productos.html"
                    class="btn btn-primary w-100"
                >
                    Ver productos
                </a>

            `;


            totalCheckout.textContent =
                '$0';


        } else {

            resumenPedido.innerHTML = '';


            carritoCheckout.forEach(producto => {

                const subtotal =
                    producto.precio *
                    producto.cantidad;


                total += subtotal;


                resumenPedido.innerHTML += `

                    <div class="d-flex gap-3 mb-3">

                        <img
                            src="${producto.imagen}"
                            alt="${producto.nombre}"
                            style="
                                width: 70px;
                                height: 70px;
                                object-fit: cover;
                                border-radius: 8px;
                            "
                        >


                        <div class="flex-grow-1">

                            <h6 class="mb-1">
                                ${producto.nombre}
                            </h6>


                            <p class="text-muted small mb-1">

                                Talla:

                                <strong>
                                    ${producto.talla || 'No especificada'}
                                </strong>

                            </p>


                            <p class="text-muted small mb-1">

                                Cantidad:

                                <strong>
                                    ${producto.cantidad}
                                </strong>

                            </p>


                            <p class="mb-0">

                                $${subtotal.toLocaleString('es-CL')}

                            </p>

                        </div>

                    </div>

                `;

            });


            totalCheckout.textContent =
                '$' + total.toLocaleString('es-CL');

        }

    }


/* =========================================================
   CONFIRMAR PEDIDO
========================================================= */

const formCheckout =
    document.getElementById('formCheckout');

if (formCheckout) {

    formCheckout.addEventListener('submit', (e) => {

        e.preventDefault();


        /* Obtener carrito actual */

        const carritoActual =
            JSON.parse(
                localStorage.getItem('carrito')
            ) || [];


        /* Verificar que haya productos */

        if (carritoActual.length === 0) {

            alert(
                'No puedes realizar una compra con el carrito vacío.'
            );

            window.location.href = 'productos.html';

            return;
        }


        /* Obtener datos del formulario */

        const nombre =
            document.getElementById('nombre').value.trim();

        const apellido =
            document.getElementById('apellido').value.trim();

        const email =
            document.getElementById('email').value.trim();

        const telefono =
            document.getElementById('telefono').value.trim();

        const direccion =
            document.getElementById('direccion').value.trim();

        const comuna =
            document.getElementById('comuna').value.trim();

        const region =
            document.getElementById('region').value;

        const metodoPago =
            document.querySelector(
                'input[name="pago"]:checked'
            );


        /* Validar datos */

        if (
            !nombre ||
            !apellido ||
            !email ||
            !telefono ||
            !direccion ||
            !comuna ||
            !region ||
            !metodoPago
        ) {

            alert(
                'Por favor completa todos los datos antes de confirmar el pedido.'
            );

            return;
        }


        /* Calcular total */

        let total = 0;

        carritoActual.forEach(producto => {

            total +=
                producto.precio *
                producto.cantidad;

        });


        /* Generar número de pedido */

        const numeroPedido =
            'ME-' +
            Date.now().toString().slice(-8);


        /* Crear pedido */

        const pedido = {

            numeroPedido: numeroPedido,

            fecha:
                new Date().toLocaleString('es-CL'),

            cliente: {

                nombre: nombre,

                apellido: apellido,

                email: email,

                telefono: telefono

            },

            envio: {

                direccion: direccion,

                comuna: comuna,

                region: region

            },

            metodoPago:
                metodoPago.value,

            productos:
                carritoActual,

            total:
                total

        };


        /* Obtener pedidos anteriores */

        const pedidosGuardados =
            JSON.parse(
                localStorage.getItem('pedidos')
            ) || [];


        /* Agregar nuevo pedido */

        pedidosGuardados.push(pedido);


        /* Guardar pedidos */

        localStorage.setItem(
            'pedidos',
            JSON.stringify(pedidosGuardados)
        );


        /* Vaciar carrito */

        localStorage.removeItem('carrito');


        /* Mensaje de confirmación */

        alert(
            `¡Compra realizada correctamente!

Número de pedido: ${numeroPedido}

Total: $${total.toLocaleString('es-CL')}`
        );


        /* Volver al inicio */

        window.location.href =
            'index.html';

    });

}
    /* =========================================================
      MOSTRAR PEDIDOS EN ADMINISTRACIÓN
   ========================================================= */

    const tablaPedidos =
        document.getElementById('tablaPedidos');


    if (tablaPedidos) {

        const pedidos =
            JSON.parse(
                localStorage.getItem('pedidos')
            ) || [];


        /* Si no existen pedidos */

        if (pedidos.length === 0) {

            tablaPedidos.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    class="text-center text-muted py-4"
                >

                    <i class="bi bi-inbox fs-2 d-block mb-2"></i>

                    No hay pedidos registrados.

                </td>

            </tr>

        `;

        } else {

            pedidos.forEach((pedido, index) => {

                /* Estado inicial */

                if (!pedido.estado) {
                    pedido.estado = 'Pendiente';
                }


                /* Contar productos */

                let cantidadProductos = 0;

                pedido.productos.forEach(producto => {

                    cantidadProductos +=
                        producto.cantidad;

                });


                /* Color del estado */

                let claseEstado = 'bg-warning text-dark';

                if (pedido.estado === 'Preparando') {
                    claseEstado = 'bg-info text-dark';
                }

                if (pedido.estado === 'Enviado') {
                    claseEstado = 'bg-primary';
                }

                if (pedido.estado === 'Entregado') {
                    claseEstado = 'bg-success';
                }


                tablaPedidos.innerHTML += `

                <tr>

                    <!-- PEDIDO -->

                    <td>

                        <strong>
                            ${pedido.numeroPedido}
                        </strong>

                    </td>


                    <!-- FECHA -->

                    <td>

                        <small>
                            ${pedido.fecha}
                        </small>

                    </td>


                    <!-- CLIENTE -->

                    <td>

                        <strong>

                            ${pedido.cliente.nombre}
                            ${pedido.cliente.apellido}

                        </strong>

                        <br>

                        <small class="text-muted">

                            ${pedido.cliente.email}

                        </small>

                    </td>


                    <!-- PRODUCTOS -->

                    <td>

                        <span class="badge bg-secondary">

                            ${cantidadProductos}

                            ${cantidadProductos === 1
                        ? 'producto'
                        : 'productos'}

                        </span>

                    </td>


                    <!-- TOTAL -->

                    <td>

                        <strong>

                            $${pedido.total.toLocaleString('es-CL')}

                        </strong>

                    </td>


                    <!-- PAGO -->

                    <td>

                        ${pedido.metodoPago}

                    </td>


                    <!-- ESTADO -->

                    <td>

                        <span class="badge ${claseEstado}">

                            ${pedido.estado}

                        </span>

                    </td>


                    <!-- ACCIONES -->

                    <td>

                        <div class="d-flex gap-1">

                            <button
                                type="button"
                                class="btn btn-sm btn-outline-primary ver-pedido"
                                data-index="${index}"
                                title="Ver detalle"
                            >

                                <i class="bi bi-eye"></i>

                            </button>


                            <select
                                class="form-select form-select-sm cambiar-estado"
                                data-index="${index}"
                                style="width: 125px;"
                            >

                                <option
                                    value="Pendiente"
                                    ${pedido.estado === 'Pendiente' ? 'selected' : ''}
                                >
                                    Pendiente
                                </option>

                                <option
                                    value="Preparando"
                                    ${pedido.estado === 'Preparando' ? 'selected' : ''}
                                >
                                    Preparando
                                </option>

                                <option
                                    value="Enviado"
                                    ${pedido.estado === 'Enviado' ? 'selected' : ''}
                                >
                                    Enviado
                                </option>

                                <option
                                    value="Entregado"
                                    ${pedido.estado === 'Entregado' ? 'selected' : ''}
                                >
                                    Entregado
                                </option>

                            </select>

                        </div>

                    </td>

                </tr>

            `;

            });


            /* =====================================================
               GUARDAR ESTADOS INICIALES
            ===================================================== */

            localStorage.setItem(
                'pedidos',
                JSON.stringify(pedidos)
            );


            /* =====================================================
               CAMBIAR ESTADO
            ===================================================== */

            document
                .querySelectorAll('.cambiar-estado')
                .forEach(select => {

                    select.addEventListener('change', () => {

                        const index =
                            parseInt(select.dataset.index);


                        const nuevoEstado =
                            select.value;


                        pedidos[index].estado =
                            nuevoEstado;


                        localStorage.setItem(
                            'pedidos',
                            JSON.stringify(pedidos)
                        );


                        /* Recargar la tabla */

                        location.reload();

                    });

                });


            /* =====================================================
               VER DETALLE DEL PEDIDO
            ===================================================== */

            document
                .querySelectorAll('.ver-pedido')
                .forEach(button => {

                    button.addEventListener('click', () => {

                        const index =
                            parseInt(button.dataset.index);


                        const pedido =
                            pedidos[index];


                        let productosHTML = '';


                        pedido.productos.forEach(producto => {

                            const subtotal =
                                producto.precio *
                                producto.cantidad;


                            productosHTML += `

                            <div class="border-bottom pb-2 mb-2">

                                <strong>
                                    ${producto.nombre}
                                </strong>

                                <br>

                                <small>

                                    Talla:
                                    ${producto.talla || 'No especificada'}

                                </small>

                                <br>

                                <small>

                                    Cantidad:
                                    ${producto.cantidad}

                                </small>

                                <br>

                                <strong>

                                    $${subtotal.toLocaleString('es-CL')}

                                </strong>

                            </div>

                        `;

                        });


                        const detalle = `

                        <strong>
                            Pedido:
                        </strong>

                        ${pedido.numeroPedido}

                        <br><br>


                        <strong>
                            Cliente:
                        </strong>

                        ${pedido.cliente.nombre}
                        ${pedido.cliente.apellido}

                        <br>

                        <strong>
                            Correo:
                        </strong>

                        ${pedido.cliente.email}

                        <br>

                        <strong>
                            Teléfono:
                        </strong>

                        ${pedido.cliente.telefono}

                        <br><br>


                        <strong>
                            Dirección de envío:
                        </strong>

                        ${pedido.envio.direccion}

                        <br>

                        <strong>
                            Comuna:
                        </strong>

                        ${pedido.envio.comuna}

                        <br>

                        <strong>
                            Región:
                        </strong>

                        ${pedido.envio.region}

                        <hr>


                        <strong>
                            Productos:
                        </strong>

                        <br><br>

                        ${productosHTML}


                        <div class="text-end mt-3">

                            <strong>
                                Total:
                                $${pedido.total.toLocaleString('es-CL')}
                            </strong>

                        </div>

                    `;


                        /* Crear ventana modal */

                        const modalHTML = `

                        <div
                            class="modal fade"
                            id="modalDetallePedido"
                            tabindex="-1"
                        >

                            <div
                                class="modal-dialog modal-dialog-centered modal-lg"
                            >

                                <div class="modal-content">

                                    <div class="modal-header">

                                        <h5 class="modal-title">

                                            <i class="bi bi-receipt me-2"></i>

                                            Detalle del pedido

                                        </h5>

                                        <button
                                            type="button"
                                            class="btn-close"
                                            data-bs-dismiss="modal"
                                        ></button>

                                    </div>


                                    <div class="modal-body">

                                        ${detalle}

                                    </div>


                                    <div class="modal-footer">

                                        <button
                                            type="button"
                                            class="btn btn-secondary"
                                            data-bs-dismiss="modal"
                                        >

                                            Cerrar

                                        </button>

                                    </div>

                                </div>

                            </div>

                        </div>

                    `;


                        /* Eliminar modal anterior */

                        const modalAnterior =
                            document.getElementById(
                                'modalDetallePedido'
                            );


                        if (modalAnterior) {
                            modalAnterior.remove();
                        }


                        /* Agregar modal */

                        document.body.insertAdjacentHTML(
                            'beforeend',
                            modalHTML
                        );


                        /* Mostrar modal */

                        const modal =
                            new bootstrap.Modal(
                                document.getElementById(
                                    'modalDetallePedido'
                                )
                            );


                        modal.show();

                    });

                });

        }

    }

/* =========================================================
   ACTUALIZAR CARRITO AL CARGAR LA PÁGINA
========================================================= */

actualizarCarrito();

});