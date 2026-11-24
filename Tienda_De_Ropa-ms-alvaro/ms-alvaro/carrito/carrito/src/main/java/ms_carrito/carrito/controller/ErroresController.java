package ms_carrito.carrito.controller;

import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class ErroresController {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> argumentoInvalido(IllegalArgumentException error) {
        return ResponseEntity.badRequest().body(Map.of("mensaje", error.getMessage()));
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> errorControlado(ResponseStatusException error) {
        String mensaje = error.getReason() != null ? error.getReason() : "Error al procesar el carrito.";
        return ResponseEntity.status(error.getStatusCode()).body(Map.of("mensaje", mensaje));
    }
}
