package ms_producto.producto.service;

import ms_producto.producto.enums.CategoriaProducto;
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
    public List<Producto> obtenerActivos() {
        return productoRepository.findAllActivos();
    }

    @Override
    public Optional<Producto> obtenerPorId(Long id) {
        return productoRepository.findById(id);
    }

    @Override
    public List<Producto> obtenerPorCategoria(String categoria) {
        if (categoria == null || categoria.isBlank()) {
            throw new IllegalArgumentException("Debe indicar una categoría.");
        }
        CategoriaProducto catEnum = CategoriaProducto.valueOf(categoria.trim().toUpperCase());
        return productoRepository.findActivosByCategoria(catEnum);
    }

    @Override
    public Producto guardar(Producto producto) {
        validarDatosProducto(producto);
        producto.setId(null);
        producto.setNombre(producto.getNombre().trim());
        producto.setDescripcion(producto.getDescripcion().trim());
        producto.setActivo(true);
        return productoRepository.save(producto);
    }

    private void validarDatosProducto(Producto producto) {
        if (producto == null) {
            throw new IllegalArgumentException("Los datos del producto son obligatorios.");
        }
        if (producto.getNombre() == null || producto.getNombre().isBlank()) {
            throw new IllegalArgumentException("El nombre del producto es obligatorio.");
        }
        if (producto.getDescripcion() == null || producto.getDescripcion().isBlank()) {
            throw new IllegalArgumentException("La descripción del producto es obligatoria.");
        }
        if (producto.getPrecio() == null || !Double.isFinite(producto.getPrecio()) || producto.getPrecio() <= 0) {
            throw new IllegalArgumentException("El precio debe ser mayor que cero.");
        }
        if (producto.getCategoria() == null) {
            throw new IllegalArgumentException("La categoría es obligatoria.");
        }
        if (producto.getStock() == null || producto.getStock() < 0) {
            throw new IllegalArgumentException("El stock no puede ser negativo.");
        }
        if (producto.getStockMinimo() == null || producto.getStockMinimo() < 0) {
            throw new IllegalArgumentException("El stock mínimo no puede ser negativo.");
        }
    }

    @Override
    @Transactional
    public Producto actualizar(Long id, Producto productoDetalles) {
        validarDatosProducto(productoDetalles);
        return productoRepository.buscarParaActualizar(id).map(producto -> {
            producto.setNombre(productoDetalles.getNombre().trim());
            producto.setDescripcion(productoDetalles.getDescripcion().trim());
            producto.setPrecio(productoDetalles.getPrecio());
            producto.setCategoria(productoDetalles.getCategoria());
            // PUT reemplaza todos los campos: incluir stock y stockMinimo en el JSON.
            producto.setStock(productoDetalles.getStock());
            producto.setStockMinimo(productoDetalles.getStockMinimo());
            return productoRepository.save(producto);
        }).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado con id: " + id));
    }

    @Override
    @Transactional
    public void eliminar(Long id) {
        if (!productoRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado con id: " + id);
        }
        productoRepository.deleteById(id);
    }

    @Override
    @Transactional
    public Producto desactivar(Long id) {
        Producto producto = bloquear(id);
        producto.desactivar();
        return productoRepository.save(producto);
    }

    @Override
    @Transactional
    public Producto activar(Long id) {
        Producto producto = bloquear(id);
        producto.activar();
        return productoRepository.save(producto);
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
        if (!producto.estaActivo()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El producto fue retirado del catálogo y no está disponible.");
        }
        if (!producto.tieneStock(cantidad)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Stock insuficiente.");
        }
        producto.setStock(producto.getStock() - cantidad);
        return productoRepository.save(producto);
    }

}
