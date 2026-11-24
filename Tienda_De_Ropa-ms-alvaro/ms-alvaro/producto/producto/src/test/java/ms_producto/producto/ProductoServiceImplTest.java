package ms_producto.producto;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.Optional;
import ms_producto.producto.enums.CategoriaProducto;
import ms_producto.producto.model.Producto;
import ms_producto.producto.repository.ProductoRepository;
import ms_producto.producto.service.ProductoServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class ProductoServiceImplTest {

    @Mock
    private ProductoRepository productoRepository;

    @InjectMocks
    private ProductoServiceImpl productoService;

    @Test
    @DisplayName("Un producto desactivado no permite descontar stock pero sí reponer stock")
    void desactivarProducto_bloqueaVentaPeroPermiteReponerStock() {
        Producto camisa = new Producto(
                "Camisa Oxford Slim",
                "Camisa casual",
                24990.0,
                CategoriaProducto.CASUAL,
                10,
                4
        );
        camisa.setId(7L);

        when(productoRepository.buscarParaActualizar(7L)).thenReturn(Optional.of(camisa));
        when(productoRepository.save(any(Producto.class))).thenAnswer(inv -> inv.getArgument(0));

        Producto retirado = productoService.desactivar(7L);
        assertFalse(retirado.estaActivo());

        ResponseStatusException errorVenta = assertThrows(
                ResponseStatusException.class,
                () -> productoService.descontarStock(7L, 1)
        );
        assertEquals(HttpStatus.CONFLICT.value(), errorVenta.getStatusCode().value());

        Producto repuesto = productoService.aumentarStock(7L, 2);
        assertEquals(12, repuesto.getStock());

        Producto reactivado = productoService.activar(7L);
        assertTrue(reactivado.estaActivo());
    }

    @Test
    @DisplayName("Guardar producto con precio inválido lanza IllegalArgumentException")
    void guardarProducto_precioCero_lanzaExcepcion() {
        Producto invalido = new Producto("Test", "Desc", 0.0, CategoriaProducto.URBANO, 5, 2);

        assertThrows(IllegalArgumentException.class, () -> productoService.guardar(invalido));
    }
}
