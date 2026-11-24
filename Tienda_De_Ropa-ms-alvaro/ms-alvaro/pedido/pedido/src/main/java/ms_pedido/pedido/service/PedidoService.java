
package ms_pedido.pedido.service;
import ms_pedido.pedido.enums.EstadoPedido;
import ms_pedido.pedido.model.Pedido;
import java.util.List;

public interface PedidoService {

    // =========================
    // CREAR PEDIDO
    // =========================
    Pedido crearPedido(Pedido pedido);

    // =========================
    // CONSULTAR PEDIDOS
    // =========================
    Pedido obtenerPedidoPorId(Long id);

    List<Pedido> obtenerPedidosPorUsuario(Long usuarioId);

    List<Pedido> obtenerTodosLosPedidos();

    // =========================
    // CAMBIAR ESTADO
    // =========================
    Pedido cambiarEstado(Long id, EstadoPedido nuevoEstado);

    Pedido cambiarEstado(Long id, EstadoPedido nuevoEstado, String motivo);

    // =========================
    // CANCELAR Y REEMBOLSAR PEDIDO
    // =========================
    Pedido cancelarPedido(Long id);

    Pedido cancelarPedido(Long id, String motivo);

    Pedido reembolsarPedido(Long id, String motivo);

    Pedido reembolsarItem(Long pedidoId, Long itemId, String motivo);
}
