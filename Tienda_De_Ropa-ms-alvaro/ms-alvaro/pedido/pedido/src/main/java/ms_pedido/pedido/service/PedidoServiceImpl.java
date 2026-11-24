
package ms_pedido.pedido.service;

import ms_pedido.pedido.model.ItemPedido;
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

        if (pedido == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Los datos del pedido son obligatorios."
            );
        }

        if (pedido.getUsuarioId() == null || pedido.getUsuarioId() <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El usuario del pedido es obligatorio."
            );
        }

        if (pedido.getItems() == null || pedido.getItems().isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El pedido debe contener al menos un producto."
            );
        }

        // Evitar que se establezca un ID manualmente
        pedido.setId(null);

        // Asignar fecha actual
        pedido.setFecha(LocalDateTime.now());

        // Los pedidos nuevos comienzan pendientes
        pedido.setEstado(EstadoPedido.PENDIENTE);
        pedido.setMontoReembolsado(0.0);
        pedido.setMotivoEstado(null);

        for (ItemPedido item : pedido.getItems()) {
            item.setId(null);
            item.setReembolsado(false);
            item.setMotivoReembolso(null);
            item.calcularSubtotal();
        }

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
        return cambiarEstado(id, nuevoEstado, null);
    }

    @Override
    @Transactional
    public Pedido cambiarEstado(Long id, EstadoPedido nuevoEstado, String motivo) {

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

        if (!pedido.puedeCambiarA(nuevoEstado)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "No se puede cambiar el pedido de " + pedido.getEstado() + " a " + nuevoEstado + "."
            );
        }

        switch (nuevoEstado) {
            case PAGADO -> pedido.marcarComoPagado();
            case PREPARANDO, ENVIADO, ENTREGADO -> pedido.setEstado(nuevoEstado);
            case CANCELADO -> {
                cancelarEstado(pedido);
                if (motivo != null && !motivo.isBlank()) {
                    pedido.setMotivoEstado(motivo.trim());
                }
            }
            case REEMBOLSADO -> pedido.marcarComoReembolsado(motivo);
            case PENDIENTE -> throw new ResponseStatusException(
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
        return cancelarPedido(id, null);
    }

    @Override
    @Transactional
    public Pedido cancelarPedido(Long id, String motivo) {

        Pedido pedido = obtenerPedidoPorId(id);

        cancelarEstado(pedido);

        if (motivo != null && !motivo.isBlank()) {
            pedido.setMotivoEstado(motivo.trim());
        } else {
            pedido.setMotivoEstado("Pedido cancelado antes de confirmar el pago");
        }

        // Guardar CANCELADO sin borrar el pedido ni sus items.
        return pedidoRepository.save(pedido);
    }

    // =========================
    // REEMBOLSAR PEDIDO COMPLETO
    // =========================

    @Override
    @Transactional
    public Pedido reembolsarPedido(Long id, String motivo) {
        return cambiarEstado(id, EstadoPedido.REEMBOLSADO, motivo);
    }

    // =========================
    // REEMBOLSAR / RETIRAR UN ÍTEM DEL PEDIDO
    // =========================

    @Override
    @Transactional
    public Pedido reembolsarItem(Long pedidoId, Long itemId, String motivo) {
        Pedido pedido = obtenerPedidoPorId(pedidoId);

        if (pedido.getEstado() == EstadoPedido.CANCELADO || pedido.getEstado() == EstadoPedido.REEMBOLSADO) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "El pedido ya está cerrado (" + pedido.getEstado() + ") y no permite reembolsar ítems."
            );
        }

        ItemPedido item = pedido.getItems().stream()
                .filter(i -> itemId != null && itemId.equals(i.getId()))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Ítem no encontrado en el pedido #" + pedidoId
                ));

        if (item.estaReembolsado()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Este producto del pedido ya fue reembolsado o retirado."
            );
        }

        String motivoFinal = (motivo != null && !motivo.isBlank())
                ? motivo.trim()
                : "Producto sin stock o retirado del catálogo";

        item.setReembolsado(true);
        item.setMotivoReembolso(motivoFinal);

        if (pedido.getEstado() == EstadoPedido.PENDIENTE) {
            pedido.recalcularTotalActivos();
            if (pedido.todosLosItemsReembolsados()) {
                pedido.setEstado(EstadoPedido.CANCELADO);
                pedido.setMotivoEstado(motivoFinal);
            }
        } else {
            pedido.recalcularMontoReembolsado();
            if (pedido.todosLosItemsReembolsados()) {
                pedido.setEstado(EstadoPedido.REEMBOLSADO);
                pedido.setMotivoEstado(motivoFinal);
            } else {
                pedido.setMotivoEstado("Reembolso parcial: " + motivoFinal);
            }
        }

        return pedidoRepository.save(pedido);
    }

    // =========================
    // MÉTODO AUXILIAR
    // =========================

    private void cancelarEstado(Pedido pedido) {

        if (pedido.estaPagado()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "No se puede cancelar un pedido ya pagado; usa REEMBOLSADO para devolver el dinero al cliente."
            );
        }

        if (pedido.getEstado() == EstadoPedido.CANCELADO) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "El pedido ya está cancelado."
            );
        }

        if (pedido.getEstado() == EstadoPedido.REEMBOLSADO) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "El pedido ya está reembolsado."
            );
        }

        pedido.cancelar();
    }
}
