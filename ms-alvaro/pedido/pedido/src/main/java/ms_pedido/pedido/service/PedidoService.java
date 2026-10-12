package ms_pedido.pedido.service;
import ms_pedido.pedido.model.Pedido;
import java.util.List;

public interface PedidoService {
    Pedido crearPedido(Pedido pedido);
    Pedido obtenerPedidoPorId(Long id);
    List<Pedido> obtenerPedidosPorUsuario(Long usuarioId);
    List<Pedido> obtenerTodosLosPedidos();
    Pedido cambiarEstado(Long id, String nuevoEstado);
}