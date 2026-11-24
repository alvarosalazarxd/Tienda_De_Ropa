package ms_carrito.carrito.service;

import ms_carrito.carrito.model.Carrito;
import ms_carrito.carrito.model.ItemCarrito;
import ms_carrito.carrito.repository.CarritoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CarritoServiceImpl implements CarritoService {

    private final CarritoRepository carritoRepository;

    public CarritoServiceImpl(CarritoRepository carritoRepository) {
        this.carritoRepository = carritoRepository;
    }

    @Override
    @Transactional
    public synchronized Carrito obtenerPorUsuarioId(Long usuarioId) {
        if (usuarioId == null || usuarioId <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El ID de usuario es obligatorio.");
        }
        return carritoRepository.findFirstByUsuarioIdOrderByIdAsc(usuarioId)
                .orElseGet(() -> carritoRepository.save(new Carrito(usuarioId)));
    }

    @Override
    @Transactional
    public Carrito agregarItem(Long usuarioId, ItemCarrito nuevoItem) {
        if (nuevoItem == null || nuevoItem.getProductoId() == null || nuevoItem.getProductoId() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El producto es obligatorio.");
        }
        if (nuevoItem.getCantidad() == null || nuevoItem.getCantidad() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La cantidad debe ser mayor que cero.");
        }
        if (nuevoItem.getPrecioUnitario() == null || !Double.isFinite(nuevoItem.getPrecioUnitario()) || nuevoItem.getPrecioUnitario() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El precio unitario debe ser mayor que cero.");
        }

        Carrito carrito = obtenerPorUsuarioId(usuarioId);
        ItemCarrito existente = carrito.getItems().stream()
                .filter(i -> nuevoItem.getProductoId().equals(i.getProductoId()))
                .findFirst()
                .orElse(null);

        if (existente != null) {
            existente.setCantidad(existente.getCantidad() + nuevoItem.getCantidad());
            existente.setPrecioUnitario(nuevoItem.getPrecioUnitario());
            if (nuevoItem.getNombreProducto() != null) {
                existente.setNombreProducto(nuevoItem.getNombreProducto());
            }
        } else {
            nuevoItem.setId(null);
            nuevoItem.calcularSubtotal();
            carrito.getItems().add(nuevoItem);
        }

        carrito.calcularTotal();
        return carritoRepository.save(carrito);
    }

    @Override
    @Transactional
    public Carrito actualizarCantidadItem(Long usuarioId, Long itemId, Integer nuevaCantidad) {
        if (nuevaCantidad == null || nuevaCantidad <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La cantidad debe ser mayor que cero.");
        }

        Carrito carrito = obtenerPorUsuarioId(usuarioId);
        boolean encontrado = false;
        for (ItemCarrito item : carrito.getItems()) {
            if (item.getId().equals(itemId)) {
                item.setCantidad(nuevaCantidad);
                encontrado = true;
                break;
            }
        }

        if (!encontrado) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Ítem no encontrado en el carrito.");
        }

        carrito.calcularTotal();
        return carritoRepository.save(carrito);
    }

    @Override
    @Transactional
    public Carrito eliminarItem(Long usuarioId, Long itemId) {
        Carrito carrito = obtenerPorUsuarioId(usuarioId);
        carrito.getItems().removeIf(item -> item.getId().equals(itemId));
        carrito.calcularTotal();
        return carritoRepository.save(carrito);
    }

    @Override
    @Transactional
    public Carrito vaciarCarrito(Long usuarioId) {
        Carrito carrito = obtenerPorUsuarioId(usuarioId);
        carrito.getItems().clear();
        carrito.setTotal(0.0);
        return carritoRepository.save(carrito);
    }
}