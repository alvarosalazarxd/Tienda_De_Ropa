
package ms_usuario.usuario;

import ms_usuario.usuario.model.Usuario;
import ms_usuario.usuario.enums.RolUsuario;
import ms_usuario.usuario.client.ProductoClient;
import ms_usuario.usuario.service.UsuarioService;

import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.web.server.ResponseStatusException;

import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.mockito.Mockito.doThrow;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class FavoritosTests {

    @Autowired
    UsuarioService service;

    @MockitoBean
    ProductoClient productoClient;

    // =====================================
    // FAVORITOS SIN DUPLICADOS
    // =====================================

    @Test
    void favoritosSeparadosSinDuplicadosYConservadosAlEditar() {

        Long a = service.guardar(
                new Usuario(
                        "Ana",
                        "ana@example.com",
                        "test",
                        RolUsuario.CLIENTE))
                .getId();

        Long b = service.guardar(
                new Usuario(
                        "Luis",
                        "luis@example.com",
                        "test",
                        RolUsuario.CLIENTE))
                .getId();

        // Los usuarios comienzan sin favoritos
        assertEquals(Set.of(), service.obtenerFavoritos(a));
        assertEquals(Set.of(), service.obtenerFavoritos(b));

        // Agregar producto favorito
        service.agregarFavorito(a, 3L);

        // No permite duplicados
        assertEquals(
                Set.of(3L),
                service.agregarFavorito(a, 3L));

        // Los favoritos son independientes
        assertEquals(Set.of(), service.obtenerFavoritos(b));

        // Actualizar usuario sin perder favoritos
        service.actualizar(
                a,
                new Usuario(
                        "Ana nueva",
                        "ana@example.com",
                        "test",
                        RolUsuario.CLIENTE));

        assertEquals(Set.of(3L), service.obtenerFavoritos(a));

        // Eliminar favorito
        assertEquals(
                Set.of(),
                service.eliminarFavorito(a, 3L));

        // Eliminar nuevamente no genera duplicados ni errores
        assertEquals(
                Set.of(),
                service.eliminarFavorito(a, 3L));
    }

    // =====================================
    // VALIDACIÓN DE IDs
    // =====================================

    @Test
    void rechazaIdsInvalidosYUsuarioInexistente() {

        Long id = service.guardar(
                new Usuario(
                        "Ana",
                        "otra@example.com",
                        "test",
                        RolUsuario.CLIENTE))
                .getId();

        // Producto con ID cero
        ResponseStatusException error1 = assertThrows(
                ResponseStatusException.class,
                () -> service.agregarFavorito(id, 0L));

        assertEquals(
                HttpStatus.BAD_REQUEST.value(),
                error1.getStatusCode().value());

        // Producto con ID negativo
        ResponseStatusException error2 = assertThrows(
                ResponseStatusException.class,
                () -> service.eliminarFavorito(id, -1L));

        assertEquals(
                HttpStatus.BAD_REQUEST.value(),
                error2.getStatusCode().value());

        // Usuario inexistente
        ResponseStatusException error3 = assertThrows(
                ResponseStatusException.class,
                () -> service.agregarFavorito(
                        Long.MAX_VALUE,
                        3L));

        assertEquals(
                HttpStatus.NOT_FOUND.value(),
                error3.getStatusCode().value());
    }

    // =====================================
    // PRODUCTO INEXISTENTE
    // =====================================

    @Test
    void productoInexistenteNoSeGuarda() {

        Long id = service.guardar(
                new Usuario(
                        "Ana",
                        "prueba@example.com",
                        "test",
                        RolUsuario.CLIENTE))
                .getId();

        // Simular que el producto no existe
        doThrow(
                new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Producto no encontrado"))
                .when(productoClient)
                .verificarExistencia(999L);

        // La operación debe fallar
        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> service.agregarFavorito(id, 999L));

        assertEquals(
                HttpStatus.NOT_FOUND.value(),
                error.getStatusCode().value());

        // El favorito no debe guardarse
        assertEquals(
                Set.of(),
                service.obtenerFavoritos(id));
    }

    // =====================================
    // USUARIO DESHABILITADO
    // =====================================

    @Test
    void usuarioDeshabilitadoNoPuedeAgregarFavoritos() {

        Long id = service.guardar(
                new Usuario(
                        "Pedro",
                        "pedro@example.com",
                        "test",
                        RolUsuario.CLIENTE))
                .getId();

        // Deshabilitar usuario
        service.deshabilitar(id);

        // Intentar agregar favorito
        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> service.agregarFavorito(id, 3L));

        assertEquals(
                HttpStatus.CONFLICT.value(),
                error.getStatusCode().value());

        assertEquals(Set.of(), service.obtenerFavoritos(id));
    }
}
