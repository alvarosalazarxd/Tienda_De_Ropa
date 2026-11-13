package ms_producto.producto.repository;

import ms_producto.producto.enums.CategoriaProducto;
import ms_producto.producto.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {
    @Query("select e from Producto e where e.id = :id")
    Optional<Producto> buscarParaActualizar(@Param("id") Long id);

    List<Producto> findByCategoria(CategoriaProducto categoria);
}