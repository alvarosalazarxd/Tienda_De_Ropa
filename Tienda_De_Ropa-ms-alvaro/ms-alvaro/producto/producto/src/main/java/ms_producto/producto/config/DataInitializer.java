package ms_producto.producto.config;

import java.util.List;
import ms_producto.producto.enums.CategoriaProducto;
import ms_producto.producto.model.Producto;
import ms_producto.producto.repository.ProductoRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner cargarProductosIniciales(ProductoRepository productoRepository) {
        return args -> {
            List<Producto> catalogoBase = List.of(
                    new Producto(
                            "Polera Oversize Negra",
                            "Polera de algodón 100% con estilo urbano holgado.",
                            19990.0,
                            CategoriaProducto.URBANO,
                            15,
                            5
                    ),
                    new Producto(
                            "Pantalón Jean Classic",
                            "Jeans de corte recto con material resistente y flexible.",
                            29990.0,
                            CategoriaProducto.CASUAL,
                            8,
                            5
                    ),
                    new Producto(
                            "Chaqueta Formal Fit",
                            "Chaqueta de diseño elegante para eventos especiales.",
                            45990.0,
                            CategoriaProducto.FORMAL,
                            10,
                            3
                    ),
                    new Producto(
                            "Gorro Beanie Urbano",
                            "Gorro tejido de lana acrílica perfecto para complementar.",
                            8990.0,
                            CategoriaProducto.ACCESORIOS,
                            20,
                            5
                    ),
                    new Producto(
                            "Cortaviento Deportivo Pro",
                            "Chaqueta cortaviento ligera e impermeable ideal para entrenar o uso diario.",
                            34990.0,
                            CategoriaProducto.DEPORTIVO,
                            12,
                            4
                    ),
                    new Producto(
                            "Pantalón Jogger Cargo",
                            "Jogger urbano negro con bolsillos laterales cargo y puño elasticado.",
                            27990.0,
                            CategoriaProducto.URBANO,
                            14,
                            4
                    ),
                    new Producto(
                            "Camisa Oxford Slim",
                            "Camisa casual de tela Oxford transpirable con calce moderno.",
                            24990.0,
                            CategoriaProducto.CASUAL,
                            10,
                            4
                    ),
                    new Producto(
                            "Mochila Urbana Minimalista",
                            "Mochila resistente de diseño minimalista con compartimento para notebook.",
                            32990.0,
                            CategoriaProducto.ACCESORIOS,
                            9,
                            3
                    )
            );

            for (Producto producto : catalogoBase) {
                if (!productoRepository.existsByNombre(producto.getNombre())) {
                    productoRepository.save(producto);
                }
            }
        };
    }
}
