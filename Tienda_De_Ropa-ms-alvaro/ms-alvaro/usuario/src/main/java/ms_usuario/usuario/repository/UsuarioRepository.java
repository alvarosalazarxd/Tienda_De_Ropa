package ms_usuario.usuario.repository;

import ms_usuario.usuario.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    @Query("select e from Usuario e where e.id = :id")
    Optional<Usuario> buscarParaActualizar(@Param("id") Long id);

    Optional<Usuario> findByEmail(String email);
}