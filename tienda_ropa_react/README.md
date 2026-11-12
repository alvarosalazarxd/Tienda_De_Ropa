# Tienda de Ropa Moda & Estilo - Conexión React con Microservicios Spring Boot

Aplicación web desarrollada en React + Vite + TypeScript siguiendo la arquitectura vista en clases (`axios` + servicios centralizados + hooks personalizados + `react-router` + `CorsConfig` en Spring Boot).

Cada página de la tienda se comunica con su microservicio correspondiente mediante `axios`:

| Microservicio | Puerto | Base de Datos MySQL | Servicio en React | Hook personalizado |
| :--- | :---: | :--- | :--- | :--- |
| **Usuarios** | `8081` | `db_usuario` | `src/services/usuario.service.ts` | `src/hooks/useUsuarios.ts` |
| **Pedidos** | `8083` | `db_pedido` | `src/services/pedido.service.ts` | `src/hooks/usePedidos.ts` |
| **Carrito** | `8084` | `db_carrito` | `src/services/carrito.service.ts` | `src/hooks/useCarrito.ts` |
| **Productos** | `8085` | `db_producto` | `src/services/producto.service.ts` | `src/hooks/useProductos.ts` |

## Requisitos previos

1. **XAMPP (MySQL)**: Abrir el panel de XAMPP e iniciar el módulo **MySQL** en el puerto `3306` (las bases de datos se crean solas gracias a `createDatabaseIfNotExist=true`).
2. **Java 17 o superior** (para levantar los 4 microservicios de Spring Boot).
3. **Node.js LTS** (incluye `npm` para instalar dependencias y correr Vite).

## Pasos para ejecutar el proyecto

1. Inicia **MySQL** en XAMPP.
2. Levanta los 4 microservicios ubicados en `../Tienda_De_Ropa-ms-alvaro/ms-alvaro` (puedes ejecutar el archivo `../iniciar_microservicios.bat` o abrir cada carpeta y correr `.\mvnw.cmd spring-boot:run`).
3. Abre una terminal dentro de esta carpeta (`tienda_ropa_react`) e instala las dependencias (solo la primera vez):

   ```bash
   npm install
   ```

4. Inicia el servidor de desarrollo de Vite:

   ```bash
   npm run dev
   ```

5. Abre el navegador en `http://localhost:5173`.

## Credenciales de prueba precargadas

Al iniciar los microservicios por primera vez, las clases `DataInitializer.java` insertan automáticamente el catálogo inicial de **Moda & Estilo** y cuentas de prueba:

- **Administrador**: `admin@modaestilo.cl` / Contraseña: `admin123`
- **Cliente de prueba**: `maria.g@email.com` / Contraseña: `cliente123`
- **Tarjeta de demostración en Checkout**: `4242 4242 4242 4242` | Vencimiento: `12/99` | CVV: `123`
