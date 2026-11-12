@echo off
chcp 65001 >nul
set "PATH=C:\Program Files\nodejs;%PATH%"
echo =========================================================
echo   INICIANDO FRONTEND REACT - MODA ^& ESTILO (Puerto 5173)
echo =========================================================
echo.

cd /d "%~dp0tienda_ropa_react"

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] No se encontro Node.js / npm instalado en tu PC.
    echo Descarga e instala la version LTS desde: https://nodejs.org
    echo Luego cierra esta ventana y vuelve a abrirla.
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo Primera ejecucion detectada: instalando dependencias con npm install...
    call npm install
)

echo.
echo Levantando servidor Vite en http://localhost:5173 ...
call npm run dev
pause
