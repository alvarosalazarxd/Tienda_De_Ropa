@echo off
chcp 65001 >nul
echo =========================================================
echo   LIBERANDO PUERTOS DE MICROSERVICIOS (8081, 8083, 8084, 8085)
echo =========================================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command "$ports = @(8081, 8083, 8084, 8085); foreach ($p in $ports) { $conns = Get-NetTCPConnection -LocalPort $p -ErrorAction SilentlyContinue; foreach ($c in $conns) { if ($c.OwningProcess -gt 4) { Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue; Write-Host \"Puerto $p liberado (PID $($c.OwningProcess))\" } } }"

echo.
echo Listo. Ya puedes volver a darle Play a los microservicios en VS Code.
pause
