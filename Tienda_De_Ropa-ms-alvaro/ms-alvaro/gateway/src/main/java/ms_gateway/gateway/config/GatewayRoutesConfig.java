package ms_gateway.gateway.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.function.RouterFunction;
import org.springframework.web.servlet.function.ServerResponse;

import static org.springframework.cloud.gateway.server.mvc.filter.AfterFilterFunctions.removeResponseHeader;
import static org.springframework.cloud.gateway.server.mvc.filter.BeforeFilterFunctions.uri;
import static org.springframework.cloud.gateway.server.mvc.handler.GatewayRouterFunctions.route;
import static org.springframework.cloud.gateway.server.mvc.handler.HandlerFunctions.http;
import static org.springframework.cloud.gateway.server.mvc.predicate.GatewayRequestPredicates.path;

@Configuration
public class GatewayRoutesConfig {

    @Value("${gateway.services.usuario-url:http://localhost:8081}")
    private String usuarioUrl;

    @Value("${gateway.services.pedido-url:http://localhost:8083}")
    private String pedidoUrl;

    @Value("${gateway.services.carrito-url:http://localhost:8084}")
    private String carritoUrl;

    @Value("${gateway.services.producto-url:http://localhost:8085}")
    private String productoUrl;

    /**
     * Centraliza todas las rutas de los microservicios bajo el puerto 8080 del API Gateway.
     */
    @Bean
    public RouterFunction<ServerResponse> gatewayRoutes() {
        return crearRuta("ms-usuario", "/api/usuarios/**", usuarioUrl)
                .and(crearRuta("ms-pedido", "/api/pedidos/**", pedidoUrl))
                .and(crearRuta("ms-carrito", "/api/carrito/**", carritoUrl))
                .and(crearRuta("ms-producto", "/api/productos/**", productoUrl));
    }

    /**
     * Construye una ruta hacia un microservicio evitando encabezados CORS duplicados
     * entre el Gateway y el servicio de destino.
     */
    private RouterFunction<ServerResponse> crearRuta(
            String routeId,
            String pathPattern,
            String targetUri
    ) {
        return route(routeId)
                .route(path(pathPattern), http())
                .before(uri(targetUri))
                .after(removeResponseHeader("Access-Control-Allow-Origin"))
                .after(removeResponseHeader("Access-Control-Allow-Credentials"))
                .after(removeResponseHeader("Access-Control-Allow-Methods"))
                .after(removeResponseHeader("Access-Control-Allow-Headers"))
                .after(removeResponseHeader("Access-Control-Expose-Headers"))
                .build();
    }
}
