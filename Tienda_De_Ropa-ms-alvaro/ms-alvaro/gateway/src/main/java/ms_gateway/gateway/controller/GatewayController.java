package ms_gateway.gateway.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/gateway")
public class GatewayController {

    @Value("${gateway.services.usuario-url:http://localhost:8081}")
    private String usuarioUrl;

    @Value("${gateway.services.pedido-url:http://localhost:8083}")
    private String pedidoUrl;

    @Value("${gateway.services.carrito-url:http://localhost:8084}")
    private String carritoUrl;

    @Value("${gateway.services.producto-url:http://localhost:8085}")
    private String productoUrl;

    /**
     * Permite verificar rápidamente que el API Gateway está activo y conocer las rutas configuradas.
     */
    @GetMapping("/estado")
    public Map<String, Object> obtenerEstado() {
        return Map.of(
                "servicio", "api-gateway",
                "estado", "ACTIVO",
                "puerto", 8080,
                "rutas", Map.of(
                        "/api/usuarios/**", usuarioUrl,
                        "/api/pedidos/**", pedidoUrl,
                        "/api/carrito/**", carritoUrl,
                        "/api/productos/**", productoUrl
                )
        );
    }
}
