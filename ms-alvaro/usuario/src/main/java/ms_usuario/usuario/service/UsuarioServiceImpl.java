
package ms_usuario.usuario.service;

import ms_usuario.usuario.model.Usuario;
import ms_usuario.usuario.client.ProductoClient;
import ms_usuario.usuario.enums.RolUsuario;
import ms_usuario.usuario.repository.UsuarioRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Set;
import java.util.Optional;

@Service
public class UsuarioServiceImpl implements UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final ProductoClient productoClient;

    public UsuarioServiceImpl(
            UsuarioRepository usuarioRepository,
            ProductoClient productoClient) {

        this.usuarioRepository = usuarioRepository;
        this.productoClient = productoClient;
    }

    // =========================
    // CONSULTAS
    // =========================

    @Override
    public List<Usuario> obtenerTodos() {
        return usuarioRepository.findAll();
    }

    @Override
    public Optional<Usuario> obtenerPorId(Long id) {
        return usuarioRepository.findById(id);
    }

    @Override
    public Optional<Usuario> obtenerPorEmail(String email) {
        return usuarioRepository.findByEmail(email);
    }

    // =========================
    // CREAR USUARIO
    // =========================

    @Override
    @Transactional
    public Usuario guardar(Usuario usuario) {

        if (usuario == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Los datos del usuario son obligatorios.");
        }

        // No permitir asignar ADMIN desde el registro.
        usuario.setRol(RolUsuario.CLIENTE);
        usuario.setActivo(true);

        // Siempre crear un registro nuevo.
        usuario.setId(null);

        return usuarioRepository.save(usuario);
    }

    // =========================
    // ACTUALIZAR USUARIO
    // =========================

    @Override
    @Transactional
    public Usuario actualizar(Long id, Usuario detallesUsuario) {

        if (detallesUsuario == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Los datos del usuario son obligatorios.");
        }

        Usuario usuario = bloquear(id);

        usuario.setNombre(detallesUsuario.getNombre());
        usuario.setEmail(detallesUsuario.getEmail());
        usuario.setPassword(detallesUsuario.getPassword());

        // El rol y el estado activo NO se cambian aquí.
        return usuarioRepository.save(usuario);
    }

    // =========================
    // CAMBIAR ROL
    // =========================

    @Override
    @Transactional
    public Usuario cambiarRol(Long id, RolUsuario nuevoRol) {

        if (nuevoRol == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El rol es obligatorio.");
        }

        Usuario usuario = bloquear(id);

        usuario.setRol(nuevoRol);

        return usuarioRepository.save(usuario);
    }

    // =========================
    // DESHABILITAR USUARIO
    // =========================

    @Override
    @Transactional
    public Usuario deshabilitar(Long id) {

        Usuario usuario = bloquear(id);

        usuario.deshabilitar();

        return usuarioRepository.save(usuario);
    }

    // =========================
    // HABILITAR USUARIO
    // =========================

    @Override
    @Transactional
    public Usuario habilitar(Long id) {

        Usuario usuario = bloquear(id);

        usuario.habilitar();

        return usuarioRepository.save(usuario);
    }

    // =========================
    // GESTIÓN DE FAVORITOS
    // =========================

    @Override
    @Transactional(readOnly = true)
    public Set<Long> obtenerFavoritos(Long id) {

        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Usuario no encontrado con id: " + id));

        return Set.copyOf(usuario.getFavoritos());
    }

    @Override
    @Transactional
    public Set<Long> agregarFavorito(Long id, Long productoId) {

        validarProductoId(productoId);

        Usuario usuario = bloquear(id);

        validarUsuarioActivo(usuario);

        productoClient.verificarExistencia(productoId);

        usuario.agregarFavorito(productoId);

        return Set.copyOf(usuario.getFavoritos());
    }

    @Override
    @Transactional
    public Set<Long> eliminarFavorito(Long id, Long productoId) {

        validarProductoId(productoId);

        Usuario usuario = bloquear(id);

        validarUsuarioActivo(usuario);

        usuario.eliminarFavorito(productoId);

        return Set.copyOf(usuario.getFavoritos());
    }

    // =========================
    // MÉTODOS AUXILIARES
    // =========================

    private Usuario bloquear(Long id) {

        return usuarioRepository.buscarParaActualizar(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Usuario no encontrado con id: " + id));
    }

    private void validarProductoId(Long productoId) {

        if (productoId == null || productoId <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El ID del producto debe ser positivo.");
        }
    }

    private void validarUsuarioActivo(Usuario usuario) {

        if (!usuario.estaActivo()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "El usuario está deshabilitado.");
        }
    }
}
