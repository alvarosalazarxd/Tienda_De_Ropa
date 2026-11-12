package ms_usuario.usuario.config;

import ms_usuario.usuario.enums.RolUsuario;
import ms_usuario.usuario.model.Usuario;
import ms_usuario.usuario.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner cargarUsuariosIniciales(UsuarioRepository usuarioRepository) {
        return args -> {
            // Creamos la cuenta de administrador por defecto si no existe todavia
            if (usuarioRepository.findByEmail("admin@modaestilo.cl").isEmpty()) {
                usuarioRepository.save(new Usuario(
                        "Juan Pérez",
                        "admin@modaestilo.cl",
                        "admin123",
                        RolUsuario.ADMIN
                ));
            }
            if (usuarioRepository.count() <= 1) {
                if (usuarioRepository.findByEmail("maria.g@email.com").isEmpty()) {
                    usuarioRepository.save(new Usuario(
                            "María González",
                            "maria.g@email.com",
                            "cliente123",
                            RolUsuario.CLIENTE
                    ));
                }
                if (usuarioRepository.findByEmail("carlos.silva@email.com").isEmpty()) {
                    usuarioRepository.save(new Usuario(
                            "Carlos Silva",
                            "carlos.silva@email.com",
                            "cliente123",
                            RolUsuario.CLIENTE
                    ));
                }
            }
        };
    }
}
