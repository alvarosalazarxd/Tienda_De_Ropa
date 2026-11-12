package ms_producto.producto.config;

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
            // Si la tabla esta vacia cargamos los productos base de Moda & Estilo
            if (productoRepository.count() == 0) {
                productoRepository.save(new Producto(
                        "Polera Oversize Negra",
                        "Polera de algodón 100% con estilo urbano holgado.",
                        19990.0,
                        CategoriaProducto.URBANO,
                        15,
                        5
                ));
                productoRepository.save(new Producto(
                        "Pantalón Jean Classic",
                        "Jeans de corte recto con material resistente y flexible.",
                        29990.0,
                        CategoriaProducto.CASUAL,
                        8,
                        5
                ));
                productoRepository.save(new Producto(
                        "Chaqueta Formal Fit",
                        "Chaqueta de diseño elegante para eventos especiales.",
                        45990.0,
                        CategoriaProducto.FORMAL,
                        10,
                        3
                ));
                productoRepository.save(new Producto(
                        "Gorro Beanie Urbano",
                        "Gorro tejido de lana acrílica perfecto para complementar.",
                        8990.0,
                        CategoriaProducto.ACCESORIOS,
                        20,
                        5
                ));
            }
        };
    }
}
