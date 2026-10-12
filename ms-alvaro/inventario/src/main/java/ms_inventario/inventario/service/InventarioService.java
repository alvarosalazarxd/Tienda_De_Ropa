package ms_inventario.inventario.service;

import ms_inventario.inventario.model.Inventario;
import java.util.List;
import java.util.Optional;

public interface InventarioService {
    List<Inventario> obtenerTodos();
    Optional<Inventario> obtenerPorProductoId(Long productoId);
    Inventario guardar(Inventario inventario);
    Inventario actualizarStock(Long productoId, Integer cantidad);
    void eliminar(Long id);
}