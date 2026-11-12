# Guía Paso a Paso y Defensa ante el Profesor: Moda & Estilo (React + Spring Boot)

## 1. Cómo trabajó el profesor en `conexion_react_springboot`

1. **CORS centralizado en Spring Boot (`config/CorsConfig.java`)**: Clase con `@Configuration` y un `@Bean WebMvcConfigurer` que permite peticiones desde Vite (`http://localhost:5173`) hacia todos los endpoints (`/**`) con `GET, POST, PUT, PATCH, DELETE, OPTIONS`.
2. **Servicios centralizados con Axios (`src/services/*.service.ts`)**:
   - Define interfaces TypeScript iguales a las entidades de Java.
   - Define tipos `Payload = Omit<Entidad, 'id'>` para crear/actualizar sin pasar `id`.
   - Crea un `apiClient = axios.create({ baseURL, headers: { 'Content-Type': 'application/json' } })` apuntando al puerto del microservicio.
   - Exporta un objeto servicio con métodos `async/await` (`listar`, `obtener`, `crear`, `actualizar`, `eliminar`).
3. **Hooks personalizados (`src/hooks/use*.ts`)**:
   - Separan el manejo de estados (`datos`, `loading`, `error`) de la interfaz visual usando `useState`, `useCallback` y `useEffect`.
   - Devuelven `{ ..., loading, error, recargar }` a las páginas.
4. **Rutas SPA con `react-router`**:
   - `<BrowserRouter>` en `src/main.tsx` y `<Routes>` / `<Route>` en `src/App.tsx` importados directamente desde `'react-router'`.

---

## 2. Mapa de puertos y servicios de tu proyecto (`tienda_ropa_react`)

| Microservicio | Puerto | Base de datos MySQL | Servicio Axios en React | Hook personalizado |
| :--- | :---: | :--- | :--- | :--- |
| **Usuarios** | `8081` | `db_usuario` | `src/services/usuario.service.ts` | `src/hooks/useUsuarios.ts` |
| **Pedidos** | `8083` | `db_pedido` | `src/services/pedido.service.ts` | `src/hooks/usePedidos.ts` |
| **Carrito** | `8084` | `db_carrito` | `src/services/carrito.service.ts` | `src/hooks/useCarrito.ts` |
| **Productos** | `8085` | `db_producto` | `src/services/producto.service.ts` | `src/hooks/useProductos.ts` |

---

## 3. Cómo levantar todo el proyecto paso a paso

1. **Instalar Node.js LTS (solo una vez en este PC)**:
   - Descárgalo desde https://nodejs.org e instálalo con las opciones por defecto para habilitar `node` y `npm`.
2. **Iniciar MySQL en XAMPP**:
   - Abre XAMPP Control Panel e inicia **MySQL** (puerto `3306`). Las 4 bases de datos se crean solas al arrancar Spring Boot.
3. **Iniciar los 4 Microservicios**:
   - Ejecuta con doble clic `iniciar_microservicios.bat` en esta misma carpeta y espera a que las 4 ventanas muestren `Started ...Application`.
4. **Iniciar React + Vite**:
   - Abre una terminal dentro de `tienda_ropa_react` y ejecuta:
     ```bash
     npm install
     npm run dev
     ```
5. **Probar en el navegador (`http://localhost:5173`)**:
   - **Cuenta Admin**: `admin@modaestilo.cl` / `admin123`
   - **Cuenta Cliente**: `maria.g@email.com` / `cliente123`
   - **Tarjeta de prueba en Checkout**: `4242 4242 4242 4242` | Vencimiento `12/99` | CVV `123`
