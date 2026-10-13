package ms_usuario.usuario.model;

import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private String email;
    private String password;
    private String rol; // CLIENTE, ADMIN

    @ElementCollection
    @CollectionTable(name = "usuario_favoritos", joinColumns = @JoinColumn(name = "usuario_id"), uniqueConstraints = @UniqueConstraint(columnNames = {
            "usuario_id", "producto_id" }))
    @Column(name = "producto_id", nullable = false)
    private Set<Long> favoritos = new HashSet<>();

    public Usuario() {
    }

    public Usuario(
            String nombre,
            String email,
            String password,
            String rol) {
        this.nombre = nombre;
        this.email = email;
        this.password = password;
        this.rol = rol;
    }

    public void agregarFavorito(Long productoId) {
        if (productoId == null || productoId <= 0) {
            throw new IllegalArgumentException(
                    "El ID del producto debe ser válido.");
        }

        favoritos.add(productoId);
    }

    public void eliminarFavorito(Long productoId) {
        favoritos.remove(productoId);
    }

    public boolean tieneFavorito(Long productoId) {
        return favoritos.contains(productoId);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRol() {
        return rol;
    }

    public void setRol(String rol) {
        this.rol = rol;
    }

    public Set<Long> getFavoritos() {
        return favoritos;
    }
}