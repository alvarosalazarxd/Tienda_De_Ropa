package ms_pedido.pedido.config;

import java.sql.Connection;
import java.sql.DatabaseMetaData;
import javax.sql.DataSource;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
public class PedidoSchemaMigrator {

    /**
     * Si una tabla pedidos antigua en MySQL/MariaDB creó la columna estado como ENUM,
     * la convertimos a VARCHAR(30) para admitir los nuevos estados (PREPARANDO, ENVIADO,
     * ENTREGADO, REEMBOLSADO) sin perder pedidos existentes.
     */
    @Bean
    public CommandLineRunner migrarColumnaEstadoPedido(DataSource dataSource, JdbcTemplate jdbcTemplate) {
        return args -> {
            try (Connection conn = dataSource.getConnection()) {
                DatabaseMetaData meta = conn.getMetaData();
                String productoDb = meta.getDatabaseProductName();
                if (productoDb == null) {
                    return;
                }
                String lower = productoDb.toLowerCase();
                if (lower.contains("mysql") || lower.contains("mariadb")) {
                    jdbcTemplate.execute("ALTER TABLE pedidos MODIFY COLUMN estado VARCHAR(30) NOT NULL");
                }
            } catch (Exception ignored) {
                // Si la tabla todavía no existe o ya tiene el tipo esperado, continuamos normalmente
            }
        };
    }
}
