
package ms_pedido.pedido.service;

import ms_pedido.pedido.model.Pedido;
import ms_pedido.pedido.enums.EstadoPedido;
import ms_pedido.pedido.repository.PedidoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PedidoServiceImpl implements PedidoService {

    private final PedidoRepository pedidoRepository;

    // INYECCIÓN DE DEPENDENCIAS
    public PedidoServiceImpl(PedidoRepository pedidoRepository) {
        this.pedidoRepository = pedidoRepository;
    }

    // =========================
    // CREAR PEDIDO
    // =========================

    @Override
    @Transactional
    public Pedido crearPedido(Pedido pedido) {

        // Evitar que se establezca un ID manualmente
        pedido.setId(null);

        // Asignar fecha actual
        pedido.setFecha(LocalDateTime.now());

        // Los pedidos nuevos comienzan pendientes
        pedido.setEstado(EstadoPedido.PENDIENTE);

        // Calcular el total según los productos
        pedido.calcularTotal();

        return pedidoRepository.save(pedido);
    }

    // =========================
    // OBTENER PEDIDO POR ID
    // =========================

    @Override
    @Transactional(readOnly = true)
    public Pedido obtenerPedidoPorId(Long id) {

        return pedidoRepository.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Pedido no encontrado con ID: " + id
                        )
                );
    }

    // =========================
    // OBTENER PEDIDOS POR USUARIO
    // =========================

    @Override
    @Transactional(readOnly = true)
    public List<Pedido> obtenerPedidosPorUsuario(Long usuarioId) {

        return pedidoRepository.findByUsuarioId(usuarioId);
    }

    // =========================
    // OBTENER TODOS LOS PEDIDOS
    // =========================

    @Override
    @Transactional(readOnly = true)
    public List<Pedido> obtenerTodosLosPedidos() {

        return pedidoRepository.findAll();
    }

    // =========================
    // CAMBIAR ESTADO DEL PEDIDO
    // =========================

    @Override
    @Transactional
    public Pedido cambiarEstado(Long id, EstadoPedido nuevoEstado) {

        Pedido pedido = obtenerPedidoPorId(id);

        if (nuevoEstado == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El estado del pedido es obligatorio."
            );
        }

        // Si el estado es igual, no hay cambios.
        if (pedido.getEstado() == nuevoEstado) {
            return pedido;
        }

        // Aplicar las reglas definidas en el modelo.
        switch (nuevoEstado) {

            case PAGADO:
                if (pedido.getEstado() != EstadoPedido.PENDIENTE) {
                    throw new ResponseStatusException(
                            HttpStatus.CONFLICT,
                            "Solo se pueden pagar pedidos pendientes."
                    );
                }
                pedido.marcarComoPagado();
                break;

            case CANCELADO:
                cancelarEstado(pedido);
                break;

            case PENDIENTE:
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "No se puede volver un pedido a PENDIENTE."
                );
        }

        return pedidoRepository.save(pedido);
    }

    // =========================
    // CANCELAR PEDIDO
    // =========================

    @Override
    @Transactional
    public Pedido cancelarPedido(Long id) {

        Pedido pedido = obtenerPedidoPorId(id);

        cancelarEstado(pedido);

        // Guardar CANCELADO sin borrar el pedido ni sus items.
        return pedidoRepository.save(pedido);
    }

    // =========================
    // MÉTODO AUXILIAR
    // =========================

    private void cancelarEstado(Pedido pedido) {

        if (pedido.getEstado() == EstadoPedido.PAGADO) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "No se puede cancelar un pedido pagado."
            );
        }

        if (pedido.getEstado() == EstadoPedido.CANCELADO) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "El pedido ya está cancelado."
            );
        }

        pedido.cancelar();
    }
}
