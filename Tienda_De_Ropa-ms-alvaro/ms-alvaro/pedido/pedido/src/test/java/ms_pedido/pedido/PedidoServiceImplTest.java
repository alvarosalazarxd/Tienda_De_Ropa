package ms_pedido.pedido;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Optional;
import ms_pedido.pedido.enums.EstadoPedido;
import ms_pedido.pedido.model.ItemPedido;
import ms_pedido.pedido.model.Pedido;
import ms_pedido.pedido.repository.PedidoRepository;
import ms_pedido.pedido.service.PedidoServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class PedidoServiceImplTest {

    @Mock
    private PedidoRepository pedidoRepository;

    @InjectMocks
    private PedidoServiceImpl pedidoService;

    private Pedido crearPedidoDemo(EstadoPedido estadoInicial) {
        Pedido pedido = new Pedido();
        pedido.setId(10L);
        pedido.setUsuarioId(2L);
        pedido.setMetodoPago("Transferencia Bancaria");

        ItemPedido item1 = new ItemPedido(7L, 1, 24990.0);
        item1.setId(101L);
        item1.setNombreProducto("Camisa Oxford Slim");
        item1.setTalla("M - Medium");

        ItemPedido item2 = new ItemPedido(1L, 2, 19990.0);
        item2.setId(102L);
        item2.setNombreProducto("Polera Oversize Negra");
        item2.setTalla("L - Large");

        pedido.setItems(List.of(item1, item2));
        pedido.setEstado(estadoInicial);
        return pedido;
    }

    @Test
    @DisplayName("Crear pedido inicia en PENDIENTE, calcula total y conserva nombres históricos")
    void crearPedido_iniciaPendienteYConservaNombreProducto() {
        Pedido entrada = crearPedidoDemo(EstadoPedido.PAGADO);
        when(pedidoRepository.save(any(Pedido.class))).thenAnswer(inv -> inv.getArgument(0));

        Pedido creado = pedidoService.crearPedido(entrada);

        assertEquals(EstadoPedido.PENDIENTE, creado.getEstado());
        assertEquals(64970.0, creado.getTotal());
        assertEquals(0.0, creado.getMontoReembolsado());
        assertEquals("Camisa Oxford Slim", creado.getItems().get(0).getNombreProducto());
        assertEquals("Transferencia Bancaria", creado.getMetodoPago());
    }

    @Test
    @DisplayName("Crear pedido sin ítems lanza 400 BAD_REQUEST")
    void crearPedido_sinItems_lanzaBadRequest() {
        Pedido vacio = new Pedido();
        vacio.setUsuarioId(2L);

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> pedidoService.crearPedido(vacio)
        );
        assertEquals(HttpStatus.BAD_REQUEST.value(), ex.getStatusCode().value());
    }

    @Test
    @DisplayName("Permite flujo completo PENDIENTE -> PAGADO -> PREPARANDO -> ENVIADO -> ENTREGADO")
    void cambiarEstado_flujoCompletoExitoso() {
        Pedido pedido = crearPedidoDemo(EstadoPedido.PENDIENTE);
        when(pedidoRepository.findById(10L)).thenReturn(Optional.of(pedido));
        when(pedidoRepository.save(any(Pedido.class))).thenAnswer(inv -> inv.getArgument(0));

        assertEquals(EstadoPedido.PAGADO, pedidoService.cambiarEstado(10L, EstadoPedido.PAGADO).getEstado());
        assertEquals(EstadoPedido.PREPARANDO, pedidoService.cambiarEstado(10L, EstadoPedido.PREPARANDO).getEstado());
        assertEquals(EstadoPedido.ENVIADO, pedidoService.cambiarEstado(10L, EstadoPedido.ENVIADO).getEstado());
        assertEquals(EstadoPedido.ENTREGADO, pedidoService.cambiarEstado(10L, EstadoPedido.ENTREGADO).getEstado());
    }

    @Test
    @DisplayName("Reembolsar un ítem de pedido PAGADO registra reembolso parcial y al último ítem marca REEMBOLSADO")
    void reembolsarItem_enPedidoPagado_actualizaMontoYEstado() {
        Pedido pedido = crearPedidoDemo(EstadoPedido.PAGADO);
        when(pedidoRepository.findById(10L)).thenReturn(Optional.of(pedido));
        when(pedidoRepository.save(any(Pedido.class))).thenAnswer(inv -> inv.getArgument(0));

        Pedido parcial = pedidoService.reembolsarItem(10L, 101L, "Producto retirado del catálogo");
        assertEquals(EstadoPedido.PAGADO, parcial.getEstado());
        assertEquals(24990.0, parcial.getMontoReembolsado());
        assertTrue(parcial.getItems().get(0).estaReembolsado());
        assertFalse(parcial.getItems().get(1).estaReembolsado());

        Pedido totalReembolsado = pedidoService.reembolsarItem(10L, 102L, "Sin stock");
        assertEquals(EstadoPedido.REEMBOLSADO, totalReembolsado.getEstado());
        assertEquals(64970.0, totalReembolsado.getMontoReembolsado());
    }

    @Test
    @DisplayName("Retirar todos los ítems de un pedido PENDIENTE lo cancela automáticamente")
    void reembolsarItem_enPedidoPendiente_recalculaTotalYCancelaAlVaciar() {
        Pedido pedido = crearPedidoDemo(EstadoPedido.PENDIENTE);
        when(pedidoRepository.findById(10L)).thenReturn(Optional.of(pedido));
        when(pedidoRepository.save(any(Pedido.class))).thenAnswer(inv -> inv.getArgument(0));

        Pedido trasPrimero = pedidoService.reembolsarItem(10L, 101L, "Producto retirado");
        assertEquals(EstadoPedido.PENDIENTE, trasPrimero.getEstado());
        assertEquals(39980.0, trasPrimero.getTotal());
        assertEquals(0.0, trasPrimero.getMontoReembolsado());

        Pedido trasSegundo = pedidoService.reembolsarItem(10L, 102L, "Producto retirado");
        assertEquals(EstadoPedido.CANCELADO, trasSegundo.getEstado());
        assertEquals(0.0, trasSegundo.getTotal());
    }

    @Test
    @DisplayName("No se puede cancelar un pedido ya pagado; debe reembolsarse")
    void cancelarPedido_cuandoEstaPagado_lanzaConflict() {
        Pedido pedido = crearPedidoDemo(EstadoPedido.PAGADO);
        when(pedidoRepository.findById(10L)).thenReturn(Optional.of(pedido));

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> pedidoService.cancelarPedido(10L)
        );
        assertEquals(HttpStatus.CONFLICT.value(), ex.getStatusCode().value());
    }
}
