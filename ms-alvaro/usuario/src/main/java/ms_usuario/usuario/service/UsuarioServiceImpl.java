package ms_usuario.usuario.service;

import ms_usuario.usuario.model.Usuario;
import ms_usuario.usuario.client.ProductoClient;
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

    public UsuarioServiceImpl(UsuarioRepository usuarioRepository, ProductoClient productoClient) {
        this.usuarioRepository = usuarioRepository;
        this.productoClient = productoClient;
    }

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

    @Override
    public Usuario guardar(Usuario usuario) {
        return usuarioRepository.save(usuario);
    }

    @Override
    @Transactional
    public Usuario actualizar(Long id, Usuario detallesUsuario) {
        return usuarioRepository.buscarParaActualizar(id).map(usuario -> {
            usuario.setNombre(detallesUsuario.getNombre());
            usuario.setEmail(detallesUsuario.getEmail());
            usuario.setPassword(detallesUsuario.getPassword());
            usuario.setRol(detallesUsuario.getRol());
            return usuarioRepository.save(usuario);
        }).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado con id: " + id));
    }

    @Override
    public void eliminar(Long id) {
        usuarioRepository.deleteById(id);
    }
    @Override
    @Transactional(readOnly = true)
    public Set<Long> obtenerFavoritos(Long id) {
        Usuario usuario = usuarioRepository.findById(id).orElseThrow(() ->
            new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        // Copiar dentro de la transacción para no devolver una colección lazy sin sesión.
        return Set.copyOf(usuario.getFavoritos());
    }

    private Usuario bloquear(Long id) {
        return usuarioRepository.buscarParaActualizar(id).orElseThrow(() ->
            new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
    }

    private void validarProductoId(Long productoId) {
        if (productoId == null || productoId <= 0) {
            throw new IllegalArgumentException("El ID del producto debe ser positivo.");
        }
    }

    @Override
    @Transactional
    public Set<Long> agregarFavorito(Long id, Long productoId) {
        validarProductoId(productoId);
        productoClient.verificarExistencia(productoId);
        Usuario usuario = bloquear(id);
        usuario.agregarFavorito(productoId);
        usuarioRepository.save(usuario);
        return Set.copyOf(usuario.getFavoritos());
    }

    @Override
    @Transactional
    public Set<Long> eliminarFavorito(Long id, Long productoId) {
        validarProductoId(productoId);
        Usuario usuario = bloquear(id);
        usuario.eliminarFavorito(productoId);
        usuarioRepository.save(usuario);
        return Set.copyOf(usuario.getFavoritos());
    }

}
