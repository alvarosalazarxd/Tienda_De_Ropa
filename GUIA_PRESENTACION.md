Guía Paso a Paso y Defensa ante el Profesor: Conexión React + Microservicios Spring Boot

Este documento explica en detalle cómo trabaja el código del profesor en conexion_react_springboot-master, cómo aplicamos exactamente su misma arquitectura para unir tu tienda Moda & Estilo con los 4 microservicios de Spring Boot, cómo levantar todo en tu computador y cómo defender el trabajo en la presentación.

1. Análisis profundo de cómo trabajó el profesor (conexion_react_springboot)

Al revisar línea por línea el proyecto del profesor (README.md, package.json, mascota.service.ts, useMascotas.ts y App.tsx), su forma de conectar React con Spring Boot se basa en 4 pilares muy claros:

A. Solución de CORS en Spring Boot (config/CorsConfig.java)

El navegador bloquea por seguridad cualquier petición desde Vite (http://localhost:5173) hacia otro puerto como Spring Boot (8080, 8081, 8085, etc.). En lugar de poner parches sueltos en cada controlador, el profesor crea un paquete config con una clase CorsConfig anotada con @Configuration que implementa WebMvcConfigurer y habilita:

Rutas: /** (todos los endpoints de la API).
Orígenes permitidos: http://localhost:5173 (Vite) y http://localhost:3000.
Métodos HTTP: GET, POST, PUT, PATCH, DELETE, OPTIONS.
B. Capa de Servicio Centralizado con axios (src/services/*.service.ts)

El profesor nunca llama a fetch o axios directo dentro del HTML/JSX cuando quiere ordenar el proyecto. En mascota.service.ts sigue siempre esta estructura:

Interfaces TypeScript: Declara una interface con exactamente los mismos atributos que el @Entity de Java en Spring Boot.
Tipo Payload con Omit: Usa export type MascotaPayload = Omit<Mascota, 'id'>; para representar los datos que se envían en un POST o PUT sin incluir el id (ya que MySQL lo genera con IDENTITY autoincremental).
Cliente axios.create: Configura API_BASE_URL leyendo import.meta.env.VITE_... ?? 'http://localhost:PUERTO/api' y encabezado 'Content-Type': 'application/json'.
Objeto Servicio (MascotaService): Agrupa métodos async/await (listar, obtener, crear, actualizar, eliminar) desestructurando { data } de la respuesta de Axios.
C. Capa de Hooks Personalizados (src/hooks/use*.ts)

En useMascotas.ts, el profesor separa la lógica de carga de la vista visual:

Maneja 3 estados con useState: la lista de datos ([]), loading (boolean) y error (Error | null).
Crea una función memorizada con useCallback que envuelve la llamada al servicio dentro de try / catch / finally.
Ejecuta la carga inicial automáticamente al abrir la página usando useEffect.
Retorna { datos, loading, error, recargar } para que cualquier página pueda mostrar un mensaje de carga, mostrar alertas si el backend está apagado o refrescar la tabla con un botón.
D. Enrutamiento SPA con react-router (src/main.tsx y src/App.tsx)
Nota técnica importante: el profesor instala react-router v7 (^7.9.5) e importa BrowserRouter, Routes, Route, Link, NavLink, useNavigate y useParams directamente desde 'react-router' (no desde 'react-router-dom'). Respetamos exactamente esa misma convención en todo tu proyecto.
2. Arquitectura aplicada a tu proyecto (tienda_ropa_react)

A diferencia del ejemplo de mascotas del profesor (que tenía 1 solo backend en el puerto 8080), tu tienda trabaja con una arquitectura de 4 microservicios independientes, cada uno con su propio puerto y su propia base de datos en MySQL:

3. Paso a paso de todo lo que se construyó y ajustó
Paso 1: Preparación de los 4 Microservicios en Spring Boot

Dentro de Tienda_De_Ropa-ms-alvaro/ms-alvaro realizamos cuatro mejoras clave siguiendo el estándar del profesor:

Configuración de CORS idéntica a la del profesor en los 4 microservicios (y limpieza de @CrossOrigin("*") en los controladores):
CorsConfig (Producto)
CorsConfig (Usuario)
CorsConfig (Carrito)
CorsConfig (Pedido)
Corrección de un bug real en ms-producto:
En la tienda original existía la categoría Accesorios, pero en CategoriaProducto.java faltaba el valor ACCESORIOS. Lo agregamos al enum.
Además, ProductoRepository.java tenía findByCategoria(String categoria) cuando el atributo en la entidad Producto era de tipo CategoriaProducto (lo que provocaba error de tipos en JPA al consultar por categoría). Se corrigió recibiendo CategoriaProducto y convirtiendo el texto en ProductoServiceImpl.java.
Carga automática de datos iniciales (DataInitializer.java):
En DataInitializer (Producto): si db_producto está vacía, inserta automáticamente las 4 prendas originales de Moda & Estilo (Polera Oversize Negra, Pantalón Jean Classic, Chaqueta Formal Fit y Gorro Beanie Urbano).
En DataInitializer (Usuario): crea automáticamente el administrador admin@modaestilo.cl (admin123) con rol ADMIN y dos clientes de ejemplo (maria.g@email.com y carlos.silva@email.com).
Pruebas unitarias verificadas: Ejecutamos .\mvnw.cmd test en los 4 microservicios y compilaron pasando el 100% de sus tests.
Paso 2: Creación de los 4 Servicios Axios en React (src/services/)

En la nueva aplicación React (tienda_ropa_react) replicamos el molde de mascota.service.ts para cada microservicio:

producto.service.ts (http://localhost:8085/api, recurso /productos): Define Producto, ProductoPayload = Omit<Producto, 'id'> y los métodos listar(), obtener(id), listarPorCategoria(cat), crear(), actualizar(), eliminar(), consultarStock(), descontarStock() y aumentarStock(). También incluye funciones auxiliares para formatear precios en pesos chilenos (Intl.NumberFormat('es-CL')) y asociar las imágenes de /img/ según la categoría.
usuario.service.ts (http://localhost:8081/api, recurso /usuarios): Conecta el registro (POST /api/usuarios), búsqueda por correo para el login (GET /api/usuarios/email/{email}), cambio de rol (PATCH /rol), habilitar/deshabilitar cuentas y el CRUD de favoritos en MySQL (GET, POST y DELETE sobre /{id}/favoritos/{productoId}).
carrito.service.ts (http://localhost:8084/api, recurso /carrito): Define Carrito, ItemCarrito e ItemCarritoPayload = Omit<ItemCarrito, 'id' | 'subtotal'>. Conecta obtener(usuarioId), agregarItem(), actualizarCantidad(), eliminarItem() y vaciar(). Si el visitante aún no inicia sesión, le asigna un ID temporal de invitado para que igual pueda usar el carrito real en MySQL.
pedido.service.ts (http://localhost:8083/api, recurso /pedidos): Conecta listar(), obtener(id), listarPorUsuario(usuarioId), crear(pedido), cambiarEstado(id, estado) y cancelar(id).
Paso 3: Creación de los 4 Hooks Personalizados (src/hooks/)

Siguiendo exactamente la estructura de useMascotas.ts del profesor:

useProductos.ts: Carga el catálogo desde el puerto 8085 y entrega { productos, loading, error, recargar }.
useUsuarios.ts: Carga la lista de usuarios desde el puerto 8081 para el panel de administración.
usePedidos.ts: Si recibe usuarioId, consulta solo las compras de ese cliente (MisComprasPage); si no recibe parámetro, consulta todos los pedidos de la tienda (AdminPage).
useCarrito.ts: Sincroniza el carrito con el puerto 8084, evita filas duplicadas sumando cantidad si el producto ya estaba en el carrito y actualiza en vivo el contador amarillo del Navbar.tsx.
Paso 4: Migración de las 11 páginas HTML a Componentes React (src/pages/)

Transformamos todas las páginas de Tienda_De_Ropa-ropa eliminando el archivo antiguo js/main.js (que guardaba todo de mentira en localStorage) para que ahora consuman los microservicios reales mediante React Router en App.tsx:

Página HTML original	Componente React creado	Ruta en React	Microservicios que consume
index.html	Home.tsx	/	ms-producto (prendas destacadas)
nosotros.html	Nosotros.tsx	/nosotros	Enlaces directos con filtro ?categoria=
productos.html	ProductoList.tsx	/productos	ms-producto, ms-carrito, ms-usuario (favoritos)
producto-detalle.html	ProductoDetalle.tsx	/productos/:id	ms-producto (obtener), ms-carrito
carrito.html	CarritoPage.tsx	/carrito	ms-carrito, ms-producto (validación de stock)
checkout.html	CheckoutPage.tsx	/checkout	ms-producto + ms-pedido + ms-carrito
login.html	LoginPage.tsx	/login	ms-usuario (obtenerPorEmail)
registro.html	RegistroPage.tsx	/registro	ms-usuario (crear)
favoritos.html	FavoritosPage.tsx	/favoritos	ms-usuario (favoritos) + ms-producto
mis-compras.html	MisComprasPage.tsx	/mis-compras	ms-pedido (listarPorUsuario, cancelar) + ms-producto
admin.html	AdminPage.tsx	/admin	ms-producto, ms-pedido y ms-usuario en tiempo real
Cómo coordina CheckoutPage.tsx los microservicios al confirmar una compra:
4. Cómo ejecutar todo en tu PC antes de presentar

IMPORTANT

Revisamos tu computador: ya tienes Java OpenJDK 21 y XAMPP instalados, pero aún no tienes instalado Node.js (necesario para que existan los comandos node y npm). Descarga e instala la versión LTS desde https://nodejs.org
 (siguiente, siguiente, finalizar) y luego abre una terminal nueva.

Sigue este orden exacto cada vez que vayas a probar o presentar:

Encender MySQL en XAMPP:
Abre XAMPP Control Panel (C:\xampp\xampp-control.exe) y haz clic en Start junto a MySQL (debe ponerse en verde en el puerto 3306).
No necesitas crear las bases de datos a mano: los 4 application.properties ya tienen createDatabaseIfNotExist=true y ddl-auto=update, así que Spring Boot creará db_usuario, db_pedido, db_carrito y db_producto automáticamente.
Iniciar los 4 Microservicios:
Haz doble clic en el archivo iniciar_microservicios.bat que dejamos en tu carpeta Tienda de ropa con react.
Se abrirán 4 consolas negras (puertos 8081, 8083, 8084 y 8085). Espera unos 15–25 segundos hasta ver el mensaje Started ...Application en las cuatro.
Instalar dependencias e iniciar React con Vite:
Abre una terminal en la carpeta C:\Users\rocke\OneDrive\Escritorio\Tienda de ropa con react\tienda_ropa_react y ejecuta:
bash
npm install
npm run dev
Nota: npm install solo se hace la primera vez para descargar node_modules. Las siguientes veces basta con npm run dev.
Abrir la tienda en el navegador:
Entra a http://localhost:5173.
5. Guion rápido de demostración y Preguntas del Profesor

TIP

Para lucirte en la presentación, ten abierta una pestaña con http://localhost:5173 y otra con http://localhost/phpmyadmin para mostrarle al profesor cómo cambian las tablas en vivo cuando creas un producto o haces una compra.

Recorrido sugerido (5 minutos)
Inicio y Catálogo (/productos): Muestra que las 4 prendas cargaron desde db_producto (puerto 8085), filtra por categoría y usa el botón Actualizar lista (que llama a recargar() del hook useProductos).
Registro e Inicio de Sesión (/registro y /login): Registra un usuario nuevo o entra con maria.g@email.com / cliente123. Marca un producto con el corazón y muéstralo en Mis favoritos (guardado en db_usuario).
Carrito y Compra (/carrito y /checkout): Agrega prendas al carrito (se guardan en db_carrito, puerto 8084), pasa al Checkout y paga con la tarjeta de demostración (4242 4242 4242 4242, vencimiento 12/99, CVV 123).
Historial del Cliente (/mis-compras): Muestra que la orden aparece como PAGADO (y si haces una con transferencia aparece PENDIENTE con botón para cancelar y devolver el stock).
Panel Administrador (/admin): Cierra sesión, entra con admin@modaestilo.cl / admin123 y muestra el Dashboard con ventas reales, crea un producto nuevo en Gestión Productos, cambia el estado de un pedido pendiente en Gestión Pedidos y habilita/deshabilita cuentas en Usuarios Registrados.
Posibles preguntas del profesor y cómo responderlas

“¿Cómo evitaron el bloqueo de CORS entre React y Spring Boot?”

Respuesta: “Aplicamos el mismo patrón que vimos en su repositorio conexion_react_springboot: creamos un paquete config con la clase CorsConfig que implementa WebMvcConfigurer en cada uno de los 4 microservicios, autorizando el origen http://localhost:5173 de Vite y los métodos GET, POST, PUT, PATCH, DELETE y OPTIONS.”

“¿Por qué crearon la carpeta services y la carpeta hooks por separado?”

Respuesta: “Para mantener responsabilidades separadas igual que en el ejemplo de Mascotas. En services dejamos únicamente la configuración de axios.create con la URL base de cada puerto (8081, 8083, 8084, 8085) y las funciones async hacia los endpoints REST. En cambio, en hooks (useProductos, useCarrito, usePedidos, useUsuarios) manejamos los estados de React (useState, useEffect, useCallback) para controlar loading, error y recargar sin ensuciar el código visual de las páginas.”

“¿Para qué sirve Omit<Producto, 'id'> en ProductoPayload?”

Respuesta: “En TypeScript la interfaz Producto exige un id numérico porque así viene desde el GET de Spring Boot, pero al crear un producto con POST el id todavía no existe porque MySQL lo genera con autoincremento (GenerationType.IDENTITY). Con Omit<Producto, 'id'> reutilizamos la misma interfaz quitándole solo el campo id.”

“¿Cómo se comunican los microservicios cuando un cliente compra en el Checkout?”

Respuesta: “Desde CheckoutPage.tsx orquestamos los tres servicios en orden: primero descontamos el stock en ms-producto (8085), luego creamos la orden en ms-pedido (8083) —pasándola a PAGADO si usó tarjeta— y finalmente vaciamos su carrito en ms-carrito (8084). Además agregamos un bloque catch de respaldo que devuelve el stock con aumentarStock si llegara a fallar el registro del pedido.”

“¿Tuvieron que modificar algo en los microservicios originales para integrarlos?”

Respuesta: “Sí, además de agregar CorsConfig y DataInitializer, detectamos que en ms-producto faltaba la categoría ACCESORIOS en el enum CategoriaProducto y que ProductoRepository.findByCategoria recibía un String en vez del enum CategoriaProducto, lo que daba error en Hibernate. Corregimos ambos detalles y verificamos que pasaran todos los tests con Maven.”
