
package ms_usuario.usuario.service;

import ms_usuario.usuario.enums.RolUsuario;
import ms_usuario.usuario.model.Usuario;
import java.util.List;
import java.util.Set;
import java.util.Optional;

public interface UsuarioService {


    Usuario cambiarRol(Long id, RolUsuario nuevoRol);

    // CONSULTAS
    List<Usuario> obtenerTodos();

    Optional<Usuario> obtenerPorId(Long id);

    Optional<Usuario> obtenerPorEmail(String email);

    // CREAR Y ACTUALIZAR
    Usuario guardar(Usuario usuario);

    Usuario actualizar(Long id, Usuario usuario);

    // HABILITAR Y DESHABILITAR
    Usuario deshabilitar(Long id);



    Usuario habilitar(Long id);

    // GESTIÓN DE FAVORITOS
    Set<Long> obtenerFavoritos(Long id);

    Set<Long> agregarFavorito(Long id, Long productoId);

    Set<Long> eliminarFavorito(Long id, Long productoId);
}
