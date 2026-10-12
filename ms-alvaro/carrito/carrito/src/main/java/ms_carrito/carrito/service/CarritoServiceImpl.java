package ms_carrito.carrito.service;

import ms_carrito.carrito.model.Carrito;
import ms_carrito.carrito.model.ItemCarrito;
import ms_carrito.carrito.repository.CarritoRepository;
import org.springframework.stereotype.Service;

@Service
public class CarritoServiceImpl implements CarritoService {

    private final CarritoRepository carritoRepository;

    public CarritoServiceImpl(CarritoRepository carritoRepository) {
        this.carritoRepository = carritoRepository;
    }

    @Override
    public Carrito obtenerPorUsuarioId(Long usuarioId) {
        return carritoRepository.findByUsuarioId(usuarioId)
                .orElseGet(() -> carritoRepository.save(new Carrito(usuarioId)));
    }

    @Override
    public Carrito agregarItem(Long usuarioId, ItemCarrito nuevoItem) {
        Carrito carrito = obtenerPorUsuarioId(usuarioId);
        nuevoItem.calcularSubtotal();
        carrito.getItems().add(nuevoItem);
        carrito.calcularTotal();
        return carritoRepository.save(carrito);
    }

    @Override
    public Carrito actualizarCantidadItem(Long usuarioId, Long itemId, Integer nuevaCantidad) {
        Carrito carrito = obtenerPorUsuarioId(usuarioId);
        
        for (ItemCarrito item : carrito.getItems()) {
            if (item.getId().equals(itemId)) {
                item.setCantidad(nuevaCantidad);
                break;
            }
        }
        
        carrito.calcularTotal();
        return carritoRepository.save(carrito);
    }

    @Override
    public Carrito eliminarItem(Long usuarioId, Long itemId) {
        Carrito carrito = obtenerPorUsuarioId(usuarioId);
        carrito.getItems().removeIf(item -> item.getId().equals(itemId));
        carrito.calcularTotal();
        return carritoRepository.save(carrito);
    }

    @Override
    public Carrito vaciarCarrito(Long usuarioId) {
        Carrito carrito = obtenerPorUsuarioId(usuarioId);
        carrito.getItems().clear();
        carrito.setTotal(0.0);
        return carritoRepository.save(carrito);
    }
}