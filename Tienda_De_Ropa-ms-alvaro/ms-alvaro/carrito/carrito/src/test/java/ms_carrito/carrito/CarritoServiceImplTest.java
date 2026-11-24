package ms_carrito.carrito;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.Optional;
import ms_carrito.carrito.model.Carrito;
import ms_carrito.carrito.model.ItemCarrito;
import ms_carrito.carrito.repository.CarritoRepository;
import ms_carrito.carrito.service.CarritoServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class CarritoServiceImplTest {

    @Mock
    private CarritoRepository carritoRepository;

    @InjectMocks
    private CarritoServiceImpl carritoService;

    @Test
    @DisplayName("Agregar el mismo producto acumula cantidad sin duplicar filas")
    void agregarItem_productoExistente_acumulaCantidad() {
        Carrito carrito = new Carrito(5L);
        ItemCarrito existente = new ItemCarrito(7L, 1, 24990.0);
        existente.setId(1L);
        existente.setNombreProducto("Camisa Oxford Slim");
        carrito.getItems().add(existente);
        carrito.calcularTotal();

        when(carritoRepository.findFirstByUsuarioIdOrderByIdAsc(5L)).thenReturn(Optional.of(carrito));
        when(carritoRepository.save(any(Carrito.class))).thenAnswer(inv -> inv.getArgument(0));

        ItemCarrito nuevo = new ItemCarrito(7L, 2, 24990.0);
        nuevo.setNombreProducto("Camisa Oxford Slim");

        Carrito resultado = carritoService.agregarItem(5L, nuevo);

        assertEquals(1, resultado.getItems().size());
        assertEquals(3, resultado.getItems().get(0).getCantidad());
        assertEquals(74970.0, resultado.getTotal());
    }

    @Test
    @DisplayName("Rechaza cantidades menores o iguales a cero")
    void agregarItem_cantidadInvalida_lanzaBadRequest() {
        ItemCarrito invalido = new ItemCarrito(7L, 0, 24990.0);

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> carritoService.agregarItem(5L, invalido)
        );
        assertEquals(HttpStatus.BAD_REQUEST.value(), ex.getStatusCode().value());
    }
}
