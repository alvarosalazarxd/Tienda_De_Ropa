
package ms_pedido.pedido.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

@Entity
@Table(name = "items_pedido")
public class ItemPedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "El producto es obligatorio")
    @Positive(message = "El ID del producto debe ser positivo")
    @Column(nullable = false)
    private Long productoId;

    @NotNull(message = "La cantidad es obligatoria")
    @Min(value = 1, message = "La cantidad debe ser mayor que cero")
    @Column(nullable = false)
    private Integer cantidad;

    @NotNull(message = "El precio unitario es obligatorio")
    @DecimalMin(
        value = "0.01",
        message = "El precio debe ser mayor que cero"
    )
    @Column(nullable = false)
    private Double precioUnitario;

    @Column(nullable = false)
    private Double subtotal = 0.0;

    @Column(name = "nombre_producto", length = 150)
    private String nombreProducto;

    @Column(length = 60)
    private String talla;

    @Column(name = "reembolsado")
    private Boolean reembolsado = false;

    @Column(name = "motivo_reembolso", length = 255)
    private String motivoReembolso;

    // CONSTRUCTOR VACÍO
    public ItemPedido() {
    }

    // CONSTRUCTOR CON PARÁMETROS
    public ItemPedido(
            Long productoId,
            Integer cantidad,
            Double precioUnitario) {

        setProductoId(productoId);
        setCantidad(cantidad);
        setPrecioUnitario(precioUnitario);
    }

    // CALCULAR SUBTOTAL
    public void calcularSubtotal() {

        if (cantidad != null && precioUnitario != null) {
            subtotal = cantidad * precioUnitario;
        } else {
            subtotal = 0.0;
        }
    }

    // GETTERS Y SETTERS

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getProductoId() {
        return productoId;
    }

    public void setProductoId(Long productoId) {
        if (productoId == null || productoId <= 0) {
            throw new IllegalArgumentException(
                "El ID del producto debe ser positivo."
            );
        }
        this.productoId = productoId;
    }

    public Integer getCantidad() {
        return cantidad;
    }

    public void setCantidad(Integer cantidad) {
        if (cantidad == null || cantidad <= 0) {
            throw new IllegalArgumentException(
                "La cantidad debe ser mayor que cero."
            );
        }

        this.cantidad = cantidad;
        calcularSubtotal();
    }

    public Double getPrecioUnitario() {
        return precioUnitario;
    }

    public void setPrecioUnitario(Double precioUnitario) {
        if (precioUnitario == null
                || !Double.isFinite(precioUnitario)
                || precioUnitario <= 0) {
            throw new IllegalArgumentException(
                "El precio debe ser mayor que cero."
            );
        }

        this.precioUnitario = precioUnitario;
        calcularSubtotal();
    }

    public Double getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(Double subtotal) {
        // Evitamos asignar manualmente un subtotal incorrecto.
        calcularSubtotal();
    }

    public String getNombreProducto() {
        return nombreProducto;
    }

    public void setNombreProducto(String nombreProducto) {
        this.nombreProducto = nombreProducto != null && !nombreProducto.isBlank()
                ? nombreProducto.trim()
                : null;
    }

    public String getTalla() {
        return talla;
    }

    public void setTalla(String talla) {
        this.talla = talla != null && !talla.isBlank() ? talla.trim() : null;
    }

    public Boolean getReembolsado() {
        return Boolean.TRUE.equals(reembolsado);
    }

    public boolean estaReembolsado() {
        return Boolean.TRUE.equals(reembolsado);
    }

    public void setReembolsado(Boolean reembolsado) {
        this.reembolsado = Boolean.TRUE.equals(reembolsado);
    }

    public String getMotivoReembolso() {
        return motivoReembolso;
    }

    public void setMotivoReembolso(String motivoReembolso) {
        this.motivoReembolso = motivoReembolso != null && !motivoReembolso.isBlank()
                ? motivoReembolso.trim()
                : null;
    }

    // RECALCULAR ANTES DE GUARDAR
    @PrePersist
    @PreUpdate
    public void antesDeGuardar() {
        calcularSubtotal();
        if (this.reembolsado == null) {
            this.reembolsado = false;
        }
    }
}
