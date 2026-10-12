package ms_favorito.favorito.controller;

import ms_favorito.favorito.model.Favorito;
import ms_favorito.favorito.service.FavoritoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favoritos")
@CrossOrigin(origins = "*")
public class FavoritoController {

    private final FavoritoService favoritoService;

    public FavoritoController(FavoritoService favoritoService) {
        this.favoritoService = favoritoService;
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<Favorito>> obtenerPorUsuario(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(favoritoService.obtenerPorUsuarioId(usuarioId));
    }

    @PostMapping
    public ResponseEntity<Favorito> agregar(@RequestParam Long usuarioId, @RequestParam Long productoId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(favoritoService.agregarFavorito(usuarioId, productoId));
    }

    @DeleteMapping("/usuario/{usuarioId}/producto/{productoId}")
    public ResponseEntity<Void> eliminar(@PathVariable Long usuarioId, @PathVariable Long productoId) {
        favoritoService.eliminarFavorito(usuarioId, productoId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarPorId(@PathVariable Long id) {
        favoritoService.eliminarPorId(id);
        return ResponseEntity.noContent().build();
    }
}