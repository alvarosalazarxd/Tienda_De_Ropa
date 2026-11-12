
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

    // =========================
    // CANCELAR PEDIDO
    // =========================
    Pedido cancelarPedido(Long id);
}
