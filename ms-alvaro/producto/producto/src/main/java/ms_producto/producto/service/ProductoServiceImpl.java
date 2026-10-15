package ms_producto.producto.service;

import ms_producto.producto.model.Producto;
import ms_producto.producto.repository.ProductoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
public class ProductoServiceImpl implements ProductoService {

    private final ProductoRepository productoRepository;

    public ProductoServiceImpl(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    @Override
    public List<Producto> obtenerTodos() {
        return productoRepository.findAll();
    }

    @Override
    public Optional<Producto> obtenerPorId(Long id) {
        return productoRepository.findById(id);
    }

    @Override
    public List<Producto> obtenerPorCategoria(String categoria) {
        return productoRepository.findByCategoria(categoria);
    }

    @Override
    public Producto guardar(Producto producto) {
        return productoRepository.save(producto);
    }

    @Override
    @Transactional
    public Producto actualizar(Long id, Producto productoDetalles) {
        return productoRepository.buscarParaActualizar(id).map(producto -> {
            producto.setNombre(productoDetalles.getNombre());
            producto.setDescripcion(productoDetalles.getDescripcion());
            producto.setPrecio(productoDetalles.getPrecio());
            producto.setCategoria(productoDetalles.getCategoria());
            // PUT reemplaza todos los campos: incluir stock y stockMinimo en el JSON.
            producto.setStock(productoDetalles.getStock());
            producto.setStockMinimo(productoDetalles.getStockMinimo());
            return productoRepository.save(producto);
        }).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado con id: " + id));
    }

    @Override
    public void eliminar(Long id) {
        productoRepository.deleteById(id);
    }
    @Override
    public Producto consultarStock(Long id) {
        return productoRepository.findById(id).orElseThrow(() ->
            new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado"));
    }

    private Producto bloquear(Long id) {
        return productoRepository.buscarParaActualizar(id).orElseThrow(() ->
            new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado"));
    }

    private void validarCantidad(Integer cantidad) {
        if (cantidad == null || cantidad <= 0) {
            throw new IllegalArgumentException("La cantidad debe ser un entero mayor que cero.");
        }
    }

    @Override
    @Transactional
    public Producto actualizarStock(Long id, Integer stock, Integer stockMinimo) {
        if (stock == null && stockMinimo == null) {
            throw new IllegalArgumentException("Indica stock o stockMinimo.");
        }
        Producto producto = bloquear(id);
        if (stock != null) producto.setStock(stock);
        if (stockMinimo != null) producto.setStockMinimo(stockMinimo);
        return productoRepository.save(producto);
    }

    @Override
    @Transactional
    public Producto aumentarStock(Long id, Integer cantidad) {
        validarCantidad(cantidad);
        Producto producto = bloquear(id);
        long nuevoStock = (long) producto.getStock() + cantidad;
        if (nuevoStock > Integer.MAX_VALUE) {
            throw new IllegalArgumentException("El stock supera el máximo permitido.");
        }
        producto.setStock((int) nuevoStock);
        return productoRepository.save(producto);
    }

    @Override
    @Transactional
    public Producto descontarStock(Long id, Integer cantidad) {
        validarCantidad(cantidad);
        Producto producto = bloquear(id);
        if (!producto.tieneStock(cantidad)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Stock insuficiente.");
        }
        producto.setStock(producto.getStock() - cantidad);
        return productoRepository.save(producto);
    }

}
