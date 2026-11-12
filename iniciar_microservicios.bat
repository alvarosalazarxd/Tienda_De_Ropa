@echo off
chcp 65001 >nul
echo =========================================================
echo   INICIANDO LOS 4 MICROSERVICIOS DE MODA ^& ESTILO
echo   Recuerda tener MySQL encendido en el panel de XAMPP
echo =========================================================
echo.

start "MS-USUARIO (Puerto 8081)" cmd /k "cd /d "%~dp0Tienda_De_Ropa-ms-alvaro\ms-alvaro\usuario" && .\mvnw.cmd spring-boot:run"
start "MS-PEDIDO (Puerto 8083)" cmd /k "cd /d "%~dp0Tienda_De_Ropa-ms-alvaro\ms-alvaro\pedido\pedido" && .\mvnw.cmd spring-boot:run"
start "MS-CARRITO (Puerto 8084)" cmd /k "cd /d "%~dp0Tienda_De_Ropa-ms-alvaro\ms-alvaro\carrito\carrito" && .\mvnw.cmd spring-boot:run"
start "MS-PRODUCTO (Puerto 8085)" cmd /k "cd /d "%~dp0Tienda_De_Ropa-ms-alvaro\ms-alvaro\producto\producto" && .\mvnw.cmd spring-boot:run"

echo Se abrieron las 4 consolas de Spring Boot.
echo Espera unos segundos a que aparezca "Started ...Application" en cada una.
pause
