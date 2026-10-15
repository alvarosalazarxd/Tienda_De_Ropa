package ms_producto.producto.service;

import ms_producto.producto.model.Producto;
import java.util.List;
import java.util.Optional;

public interface ProductoService {
    List<Producto> obtenerTodos();
    Optional<Producto> obtenerPorId(Long id);
    List<Producto> obtenerPorCategoria(String categoria);
    Producto guardar(Producto producto);
    Producto actualizar(Long id, Producto producto);
    void eliminar(Long id);
    Producto consultarStock(Long id);
    Producto actualizarStock(Long id, Integer stock, Integer stockMinimo);
    Producto aumentarStock(Long id, Integer cantidad);
    Producto descontarStock(Long id, Integer cantidad);
}
