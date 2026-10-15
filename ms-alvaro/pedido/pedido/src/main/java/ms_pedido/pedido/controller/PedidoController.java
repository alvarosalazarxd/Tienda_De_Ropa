
package ms_pedido.pedido.controller;

import ms_pedido.pedido.model.Pedido;
import ms_pedido.pedido.enums.EstadoPedido;
import ms_pedido.pedido.service.PedidoService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pedidos")
@CrossOrigin(origins = "*")
public class PedidoController {

    @Autowired
    private PedidoService pedidoService;

    // =========================
    // CREAR PEDIDO
    // =========================

    @PostMapping
    public ResponseEntity<Pedido> crearPedido(
            @RequestBody Pedido pedido) {

        Pedido nuevoPedido = pedidoService.crearPedido(pedido);

        return new ResponseEntity<>(
                nuevoPedido,
                HttpStatus.CREATED
        );
    }

    // =========================
    // OBTENER PEDIDO POR ID
    // =========================

    @GetMapping("/{id}")
    public ResponseEntity<Pedido> obtenerPedidoPorId(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                pedidoService.obtenerPedidoPorId(id)
        );
    }

    // =========================
    // OBTENER PEDIDOS POR USUARIO
    // =========================

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<Pedido>> obtenerPedidosPorUsuario(
            @PathVariable Long usuarioId) {

        return ResponseEntity.ok(
                pedidoService.obtenerPedidosPorUsuario(usuarioId)
        );
    }

    // =========================
    // OBTENER TODOS LOS PEDIDOS
    // =========================

    @GetMapping
    public ResponseEntity<List<Pedido>> obtenerTodosLosPedidos() {

        return ResponseEntity.ok(
                pedidoService.obtenerTodosLosPedidos()
        );
    }

    // =========================
    // CAMBIAR ESTADO
    // =========================

    @PutMapping("/{id}/estado")
    public ResponseEntity<Pedido> cambiarEstado(
            @PathVariable Long id,
            @RequestParam EstadoPedido estado) {

        return ResponseEntity.ok(
                pedidoService.cambiarEstado(id, estado)
        );
    }

    // =========================
    // CANCELAR PEDIDO
    // =========================

    @PatchMapping("/{id}/cancelar")
    public ResponseEntity<Pedido> cancelarPedido(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                pedidoService.cancelarPedido(id)
        );
    }
}
