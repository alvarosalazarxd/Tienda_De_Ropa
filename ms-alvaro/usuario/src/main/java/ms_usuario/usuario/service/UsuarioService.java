package ms_usuario.usuario.service;

import ms_usuario.usuario.model.Usuario;
import java.util.List;
import java.util.Set;
import java.util.Optional;

public interface UsuarioService {
    List<Usuario> obtenerTodos();
    Optional<Usuario> obtenerPorId(Long id);
    Optional<Usuario> obtenerPorEmail(String email);
    Usuario guardar(Usuario usuario);
    Usuario actualizar(Long id, Usuario usuario);
    void eliminar(Long id);
    Set<Long> obtenerFavoritos(Long id);
    Set<Long> agregarFavorito(Long id, Long productoId);
    Set<Long> eliminarFavorito(Long id, Long productoId);
}
