package ms_usuario.usuario;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.Optional;
import ms_usuario.usuario.client.ProductoClient;
import ms_usuario.usuario.enums.RolUsuario;
import ms_usuario.usuario.model.Usuario;
import ms_usuario.usuario.repository.UsuarioRepository;
import ms_usuario.usuario.service.UsuarioServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class UsuarioServiceImplTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private ProductoClient productoClient;

    @InjectMocks
    private UsuarioServiceImpl usuarioService;

    @Test
    @DisplayName("No permite registrar un correo electrónico duplicado")
    void guardar_correoDuplicado_lanzaConflict() {
        Usuario existente = new Usuario("Juan", "juan@email.com", "123456", RolUsuario.CLIENTE);
        when(usuarioRepository.findByEmail("juan@email.com")).thenReturn(Optional.of(existente));

        Usuario nuevo = new Usuario("Otro Juan", "  JUAN@email.com ", "123456");

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> usuarioService.guardar(nuevo)
        );
        assertEquals(HttpStatus.CONFLICT.value(), ex.getStatusCode().value());
    }

    @Test
    @DisplayName("No permite deshabilitar ni degradar al único administrador activo")
    void protegerUltimoAdminActivo() {
        Usuario admin = new Usuario("Admin", "admin@modaestilo.cl", "admin123", RolUsuario.ADMIN);
        admin.setId(1L);

        when(usuarioRepository.buscarParaActualizar(1L)).thenReturn(Optional.of(admin));
        when(usuarioRepository.countByRolAndActivoTrue(RolUsuario.ADMIN)).thenReturn(1L);

        ResponseStatusException errDeshab = assertThrows(
                ResponseStatusException.class,
                () -> usuarioService.deshabilitar(1L)
        );
        assertEquals(HttpStatus.CONFLICT.value(), errDeshab.getStatusCode().value());

        ResponseStatusException errRol = assertThrows(
                ResponseStatusException.class,
                () -> usuarioService.cambiarRol(1L, RolUsuario.CLIENTE)
        );
        assertEquals(HttpStatus.CONFLICT.value(), errRol.getStatusCode().value());
    }
}
