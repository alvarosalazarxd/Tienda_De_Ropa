package ms_usuario.usuario;

import ms_usuario.usuario.model.Usuario;
import ms_usuario.usuario.client.ProductoClient;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.HttpStatus;
import static org.mockito.Mockito.doThrow;
import ms_usuario.usuario.service.UsuarioService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.web.server.ResponseStatusException;
import java.util.Set;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class FavoritosTests {
    @Autowired UsuarioService service;
    @MockitoBean ProductoClient productoClient;

    @Test void favoritosSeparadosSinDuplicadosYConservadosAlEditar() {
        Long a = service.guardar(new Usuario("Ana", "ana@example.com", "test", "CLIENTE")).getId();
        Long b = service.guardar(new Usuario("Luis", "luis@example.com", "test", "CLIENTE")).getId();
        assertEquals(Set.of(), service.obtenerFavoritos(a));
        service.agregarFavorito(a, 3L);
        assertEquals(Set.of(3L), service.agregarFavorito(a, 3L));
        assertEquals(Set.of(), service.obtenerFavoritos(b));
        service.actualizar(a, new Usuario("Ana nueva", "ana@example.com", "test", "CLIENTE"));
        assertEquals(Set.of(3L), service.obtenerFavoritos(a));
        assertEquals(Set.of(), service.eliminarFavorito(a, 3L));
        assertEquals(Set.of(), service.eliminarFavorito(a, 3L));
    }

    @Test void rechazaIdsInvalidosYUsuarioInexistente() {
        Long id = service.guardar(new Usuario("Ana", "otra@example.com", "test", "CLIENTE")).getId();
        assertThrows(IllegalArgumentException.class, () -> service.agregarFavorito(id, 0L));
        assertThrows(IllegalArgumentException.class, () -> service.eliminarFavorito(id, -1L));
        assertEquals(404, assertThrows(ResponseStatusException.class,
            () -> service.agregarFavorito(Long.MAX_VALUE, 3L)).getStatusCode().value());
    }
    @Test void productoInexistenteNoSeGuarda() {
        Long id = service.guardar(new Usuario("Ana", "prueba@example.com", "test", "CLIENTE")).getId();
        doThrow(new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado"))
            .when(productoClient).verificarExistencia(999L);
        assertThrows(ResponseStatusException.class, () -> service.agregarFavorito(id, 999L));
        assertEquals(Set.of(), service.obtenerFavoritos(id));
    }
}
