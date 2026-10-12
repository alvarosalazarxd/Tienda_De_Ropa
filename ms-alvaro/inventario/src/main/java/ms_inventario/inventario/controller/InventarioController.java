package ms_inventario.inventario.controller;

import ms_inventario.inventario.model.Inventario;
import ms_inventario.inventario.service.InventarioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventario")
@CrossOrigin(origins = "*")
public class InventarioController {

    private final InventarioService inventarioService;

    public InventarioController(InventarioService inventarioService) {
        this.inventarioService = inventarioService;
    }

    @GetMapping
    public ResponseEntity<List<Inventario>> obtenerTodos() {
        return ResponseEntity.ok(inventarioService.obtenerTodos());
    }

    @GetMapping("/producto/{productoId}")
    public ResponseEntity<Inventario> obtenerPorProductoId(@PathVariable Long productoId) {
        return inventarioService.obtenerPorProductoId(productoId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Inventario> crear(@RequestBody Inventario inventario) {
        return ResponseEntity.status(HttpStatus.CREATED).body(inventarioService.guardar(inventario));
    }

    @PutMapping("/producto/{productoId}")
    public ResponseEntity<Inventario> actualizarStock(@PathVariable Long productoId, @RequestParam Integer cantidad) {
        return ResponseEntity.ok(inventarioService.actualizarStock(productoId, cantidad));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        inventarioService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}