package ms_carrito.carrito.controller;

import ms_carrito.carrito.model.Carrito;
import ms_carrito.carrito.model.ItemCarrito;
import ms_carrito.carrito.service.CarritoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/carrito")
public class CarritoController {

    private final CarritoService carritoService;

    public CarritoController(CarritoService carritoService) {
        this.carritoService = carritoService;
    }

    @GetMapping("/{usuarioId}")
    public ResponseEntity<Carrito> obtenerCarrito(@PathVariable("usuarioId") Long usuarioId) {
        return ResponseEntity.ok(carritoService.obtenerPorUsuarioId(usuarioId));
    }

    @PostMapping("/{usuarioId}/items")
    public ResponseEntity<Carrito> agregarItem(@PathVariable("usuarioId") Long usuarioId, @RequestBody ItemCarrito item) {
        return ResponseEntity.ok(carritoService.agregarItem(usuarioId, item));
    }

    @PutMapping("/{usuarioId}/items/{itemId}")
    public ResponseEntity<Carrito> actualizarCantidad(
            @PathVariable("usuarioId") Long usuarioId,
            @PathVariable("itemId") Long itemId,
            @RequestParam("cantidad") Integer cantidad) {
        return ResponseEntity.ok(carritoService.actualizarCantidadItem(usuarioId, itemId, cantidad));
    }

    @DeleteMapping("/{usuarioId}/items/{itemId}")
    public ResponseEntity<Carrito> eliminarItem(
            @PathVariable("usuarioId") Long usuarioId,
            @PathVariable("itemId") Long itemId) {
        return ResponseEntity.ok(carritoService.eliminarItem(usuarioId, itemId));
    }

    @DeleteMapping("/{usuarioId}")
    public ResponseEntity<Carrito> vaciarCarrito(@PathVariable("usuarioId") Long usuarioId) {
        return ResponseEntity.ok(carritoService.vaciarCarrito(usuarioId));
    }
}
