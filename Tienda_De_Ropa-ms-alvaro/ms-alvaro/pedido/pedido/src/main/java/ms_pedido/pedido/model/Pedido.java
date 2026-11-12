
package ms_pedido.pedido.model;

import jakarta.persistence.*;
import ms_pedido.pedido.enums.EstadoPedido;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pedidos")
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long usuarioId;

    @Column(nullable = false)
    private LocalDateTime fecha = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoPedido estado = EstadoPedido.PENDIENTE;

    @Column(nullable = false)
    private Double total = 0.0;

    @OneToMany(
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @JoinColumn(name = "pedido_id")
    private List<ItemPedido> items = new ArrayList<>();

    // CONSTRUCTOR VACÍO
    public Pedido() {
    }

    // =========================
    // GESTIÓN DE ESTADOS
    // =========================

    public void cancelar() {

        if (estado == EstadoPedido.PAGADO) {
            throw new IllegalStateException(
                    "No se puede cancelar un pedido pagado."
            );
        }

        if (estado == EstadoPedido.CANCELADO) {
            throw new IllegalStateException(
                    "El pedido ya está cancelado."
            );
        }

        this.estado = EstadoPedido.CANCELADO;
    }

    public void marcarComoPagado() {

        if (estado != EstadoPedido.PENDIENTE) {
            throw new IllegalStateException(
                    "Solo se pueden pagar pedidos pendientes."
            );
        }

        this.estado = EstadoPedido.PAGADO;
    }

    public boolean estaCancelado() {
        return estado == EstadoPedido.CANCELADO;
    }

    // =========================
    // CALCULAR TOTAL
    // =========================

    public void calcularTotal() {

        this.total = items.stream()
                .mapToDouble(item -> {
                    item.calcularSubtotal();

                    return item.getSubtotal() != null
                            ? item.getSubtotal()
                            : 0.0;
                })
                .sum();
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

    public Long getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(Long usuarioId) {
        this.usuarioId = usuarioId;
    }

    public LocalDateTime getFecha() {
        return fecha;
    }

    public void setFecha(LocalDateTime fecha) {
        this.fecha = fecha;
    }

    public EstadoPedido getEstado() {
        return estado;
    }

    public void setEstado(EstadoPedido estado) {
        if (estado == null) {
            throw new IllegalArgumentException(
                    "El estado no puede ser nulo."
            );
        }

        this.estado = estado;
    }

    public Double getTotal() {
        return total;
    }

    public void setTotal(Double total) {
        this.total = total;
    }

    public List<ItemPedido> getItems() {
        return items;
    }

    public void setItems(List<ItemPedido> items) {

        if (items == null) {
            throw new IllegalArgumentException(
                    "La lista de productos no puede ser nula."
            );
        }

        this.items.clear();
        this.items.addAll(new ArrayList<>(items));

        calcularTotal();
    }
}
