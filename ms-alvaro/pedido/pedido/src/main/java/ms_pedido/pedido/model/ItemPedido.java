
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

    // RECALCULAR ANTES DE GUARDAR
    @PrePersist
    @PreUpdate
    public void antesDeGuardar() {
        calcularSubtotal();
    }
}
