package ms_carrito.carrito.service;

import ms_carrito.carrito.model.Carrito;
import ms_carrito.carrito.model.ItemCarrito;

public interface CarritoService {
    Carrito obtenerPorUsuarioId(Long usuarioId);
    Carrito agregarItem(Long usuarioId, ItemCarrito item);
    Carrito actualizarCantidadItem(Long usuarioId, Long itemId, Integer nuevaCantidad);
    Carrito eliminarItem(Long usuarioId, Long itemId);
    Carrito vaciarCarrito(Long usuarioId);
}