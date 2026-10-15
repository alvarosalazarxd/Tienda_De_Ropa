
package ms_usuario.usuario.model;

import ms_usuario.usuario.enums.RolUsuario;
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

    // ROL DEL USUARIO
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RolUsuario rol = RolUsuario.CLIENTE;

    // ESTADO DEL USUARIO
    @Column(nullable = false)
    private Boolean activo = true;

    // PRODUCTOS FAVORITOS
    @ElementCollection
    @CollectionTable(name = "usuario_favoritos", joinColumns = @JoinColumn(name = "usuario_id"), uniqueConstraints = @UniqueConstraint(columnNames = {
            "usuario_id", "producto_id" }))
    @Column(name = "producto_id", nullable = false)
    private Set<Long> favoritos = new HashSet<>();

    // CONSTRUCTOR VACÍO
    public Usuario() {
    }

    // CONSTRUCTOR CON ROL
    public Usuario(
            String nombre,
            String email,
            String password,
            RolUsuario rol) {

        this.nombre = nombre;
        this.email = email;
        this.password = password;
        setRol(rol);
        this.activo = true;
    }

    // CONSTRUCTOR PARA CLIENTES
    public Usuario(
            String nombre,
            String email,
            String password) {

        this.nombre = nombre;
        this.email = email;
        this.password = password;
        this.rol = RolUsuario.CLIENTE;
        this.activo = true;
    }

    // =========================
    // GESTIÓN DE ESTADO
    // =========================

    public void deshabilitar() {
        this.activo = false;
    }

    public void habilitar() {
        this.activo = true;
    }

    public boolean estaActivo() {
        return Boolean.TRUE.equals(activo);
    }

    // =========================
    // GESTIÓN DE ROLES
    // =========================

    public boolean esAdministrador() {
        return rol == RolUsuario.ADMIN;
    }

    public boolean esCliente() {
        return rol == RolUsuario.CLIENTE;
    }

    // =========================
    // GESTIÓN DE FAVORITOS
    // =========================

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

    // =========================
    // GETTERS Y SETTERS
    // =========================

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

    public RolUsuario getRol() {
        return rol;
    }

    public void setRol(RolUsuario rol) {

        if (rol == null) {
            throw new IllegalArgumentException(
                    "El rol no puede ser nulo.");
        }

        this.rol = rol;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {

        if (activo == null) {
            throw new IllegalArgumentException(
                    "El estado del usuario no puede ser nulo.");
        }

        this.activo = activo;
    }

    public Set<Long> getFavoritos() {
        return favoritos;
    }
}
