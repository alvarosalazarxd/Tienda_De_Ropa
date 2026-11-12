# Microservicios Spring Boot - Tienda de Ropa Moda & Estilo

Proyecto backend dividido en **4 microservicios independientes** conectados a **MySQL (XAMPP)** y consumidos desde el frontend en React (`../tienda_ropa_react`).

## Puertos y Bases de Datos

| Microservicio | Carpeta | Puerto | Base de Datos MySQL | Endpoint Principal |
| :--- | :--- | :---: | :--- | :--- |
| **Usuario** | `ms-alvaro/usuario` | `8081` | `db_usuario` | `http://localhost:8081/api/usuarios` |
| **Pedido** | `ms-alvaro/pedido/pedido` | `8083` | `db_pedido` | `http://localhost:8083/api/pedidos` |
| **Carrito** | `ms-alvaro/carrito/carrito` | `8084` | `db_carrito` | `http://localhost:8084/api/carrito/{usuarioId}` |
| **Producto** | `ms-alvaro/producto/producto` | `8085` | `db_producto` | `http://localhost:8085/api/productos` |

## Cómo iniciar los 4 Microservicios en VS Code

1. Asegúrate de tener **MySQL** encendido en **XAMPP** (puerto `3306`).
2. En la barra izquierda de VS Code, haz clic en el ícono **Ejecutar y depurar** (`Ctrl + Shift + D`, el triángulo con el bichito).
3. Arriba selecciona **"Iniciar los 4 Microservicios"** y presiona el botón verde **Play (`▷`)**.
   - *Alternativa:* Presiona `Ctrl + P`, escribe `Application` y dale a **`Run`** sobre `UsuarioApplication.java`, `ProductoApplication.java`, `CarritoApplication.java` y `PedidoApplication.java`.
