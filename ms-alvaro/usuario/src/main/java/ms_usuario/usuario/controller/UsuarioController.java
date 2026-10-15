
package ms_usuario.usuario.controller;

import ms_usuario.usuario.enums.RolUsuario;
import ms_usuario.usuario.model.Usuario;
import ms_usuario.usuario.service.UsuarioService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {

        private final UsuarioService usuarioService;

        public UsuarioController(UsuarioService usuarioService) {
                this.usuarioService = usuarioService;
        }

        // =========================
        // CONSULTAR TODOS
        // =========================

        @GetMapping
        public ResponseEntity<List<Usuario>> obtenerTodos() {
                return ResponseEntity.ok(usuarioService.obtenerTodos());
        }

        // =========================
        // CONSULTAR POR ID
        // =========================

        @GetMapping("/{id}")
        public ResponseEntity<Usuario> obtenerPorId(
                        @PathVariable Long id) {

                return usuarioService.obtenerPorId(id)
                                .map(ResponseEntity::ok)
                                .orElse(ResponseEntity.notFound().build());
        }

        // =========================
        // CONSULTAR POR EMAIL
        // =========================

        @GetMapping("/email/{email}")
        public ResponseEntity<Usuario> obtenerPorEmail(
                        @PathVariable String email) {

                return usuarioService.obtenerPorEmail(email)
                                .map(ResponseEntity::ok)
                                .orElse(ResponseEntity.notFound().build());
        }

        // =========================
        // CREAR USUARIO
        // =========================

        @PostMapping
        public ResponseEntity<Usuario> crear(
                        @RequestBody Usuario usuario) {

                Usuario nuevoUsuario = usuarioService.guardar(usuario);

                return ResponseEntity
                                .status(HttpStatus.CREATED)
                                .body(nuevoUsuario);
        }

        // =========================
        // ACTUALIZAR USUARIO
        // =========================

        @PutMapping("/{id}")
        public ResponseEntity<Usuario> actualizar(
                        @PathVariable Long id,
                        @RequestBody Usuario usuario) {

                return ResponseEntity.ok(
                                usuarioService.actualizar(id, usuario));
        }

        // =========================
        // DESHABILITAR USUARIO
        // =========================

        @PatchMapping("/{id}/deshabilitar")
        public ResponseEntity<Usuario> deshabilitar(
                        @PathVariable Long id) {

                return ResponseEntity.ok(
                                usuarioService.deshabilitar(id));
        }

        @PatchMapping("/{id}/rol")
        public ResponseEntity<Usuario> cambiarRol(
                        @PathVariable Long id,
                        @RequestParam RolUsuario rol) {

                return ResponseEntity.ok(
                                usuarioService.cambiarRol(id, rol));
        }

        // =========================
        // HABILITAR USUARIO
        // =========================

        @PatchMapping("/{id}/habilitar")
        public ResponseEntity<Usuario> habilitar(
                        @PathVariable Long id) {

                return ResponseEntity.ok(
                                usuarioService.habilitar(id));
        }

        // =========================
        // CONSULTAR FAVORITOS
        // =========================

        @GetMapping("/{id}/favoritos")
        public ResponseEntity<Set<Long>> obtenerFavoritos(
                        @PathVariable Long id) {

                return ResponseEntity.ok(
                                usuarioService.obtenerFavoritos(id));
        }

        // =========================
        // AGREGAR FAVORITO
        // =========================

        @PostMapping("/{id}/favoritos/{productoId}")
        public ResponseEntity<Set<Long>> agregarFavorito(
                        @PathVariable Long id,
                        @PathVariable Long productoId) {

                return ResponseEntity.ok(
                                usuarioService.agregarFavorito(id, productoId));
        }

        // =========================
        // ELIMINAR FAVORITO
        // =========================

        @DeleteMapping("/{id}/favoritos/{productoId}")
        public ResponseEntity<Set<Long>> eliminarFavorito(
                        @PathVariable Long id,
                        @PathVariable Long productoId) {

                return ResponseEntity.ok(
                                usuarioService.eliminarFavorito(id, productoId));
        }
}
