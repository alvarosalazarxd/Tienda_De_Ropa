package ms_producto.producto.controller;

import ms_producto.producto.model.Producto;
import ms_producto.producto.service.ProductoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "*")
public class ProductoController {

    private final ProductoService productoService;

    public ProductoController(ProductoService productoService) {
        this.productoService = productoService;
    }

    @GetMapping
    public ResponseEntity<List<Producto>> obtenerTodos() {
        return ResponseEntity.ok(productoService.obtenerTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Producto> obtenerPorId(@PathVariable Long id) {
        return productoService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/categoria/{categoria}")
    public ResponseEntity<List<Producto>> obtenerPorCategoria(@PathVariable String categoria) {
        return ResponseEntity.ok(productoService.obtenerPorCategoria(categoria));
    }

    @PostMapping
    public ResponseEntity<Producto> crear(@RequestBody Producto producto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productoService.guardar(producto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Producto> actualizar(@PathVariable Long id, @RequestBody Producto producto) {
        return ResponseEntity.ok(productoService.actualizar(id, producto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        productoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
    public record StockRespuesta(Long productoId, Integer stock, Integer stockMinimo,
                                 boolean stockBajo) {}
    public record AjusteStock(Integer stock, Integer stockMinimo) {}
    public record MovimientoStock(Integer cantidad) {}

    private StockRespuesta respuestaStock(Producto p) {
        return new StockRespuesta(p.getId(), p.getStock(), p.getStockMinimo(), p.tieneStockBajo());
    }

    @GetMapping("/{id}/stock")
    public StockRespuesta consultarStock(@PathVariable Long id) {
        return respuestaStock(productoService.consultarStock(id));
    }

    @PatchMapping("/{id}/stock")
    public StockRespuesta actualizarStock(@PathVariable Long id, @RequestBody AjusteStock datos) {
        return respuestaStock(productoService.actualizarStock(id, datos.stock(), datos.stockMinimo()));
    }

    @PostMapping("/{id}/stock/aumentar")
    public StockRespuesta aumentarStock(@PathVariable Long id, @RequestBody MovimientoStock datos) {
        return respuestaStock(productoService.aumentarStock(id, datos.cantidad()));
    }

    @PostMapping("/{id}/stock/descontar")
    public StockRespuesta descontarStock(@PathVariable Long id, @RequestBody MovimientoStock datos) {
        return respuestaStock(productoService.descontarStock(id, datos.cantidad()));
    }

}
