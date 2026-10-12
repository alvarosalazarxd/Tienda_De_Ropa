package ms_inventario.inventario.service;

import ms_inventario.inventario.model.Inventario;
import ms_inventario.inventario.repository.InventarioRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class InventarioServiceImpl implements InventarioService {

    private final InventarioRepository inventarioRepository;

    public InventarioServiceImpl(InventarioRepository inventarioRepository) {
        this.inventarioRepository = inventarioRepository;
    }

    @Override
    public List<Inventario> obtenerTodos() {
        return inventarioRepository.findAll();
    }

    @Override
    public Optional<Inventario> obtenerPorProductoId(Long productoId) {
        return inventarioRepository.findByProductoId(productoId);
    }

    @Override
    public Inventario guardar(Inventario inventario) {
        return inventarioRepository.save(inventario);
    }

    @Override
    public Inventario actualizarStock(Long productoId, Integer cantidad) {
        Inventario inventario = inventarioRepository.findByProductoId(productoId)
                .orElseThrow(() -> new RuntimeException("Inventario no encontrado para el producto ID: " + productoId));
        inventario.setStock(cantidad);
        return inventarioRepository.save(inventario);
    }

    @Override
    public void eliminar(Long id) {
        inventarioRepository.deleteById(id);
    }
}