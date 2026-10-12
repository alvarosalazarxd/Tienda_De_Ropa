package ms_pedido.pedido.model;

import jakarta.persistence.*;
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

    private LocalDateTime fecha;
    private String estado; // PENDIENTE, PAGADO, CANCELADO
    private Double total;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "pedido_id")
    private List<ItemPedido> items = new ArrayList<>();

    public Pedido() {
        this.fecha = LocalDateTime.now();
        this.estado = "PENDIENTE";
        this.total = 0.0;
    }

    public void calcularTotal() {
        this.total = items.stream()
                .mapToDouble(item -> {
                    item.calcularSubtotal();
                    return item.getSubtotal() != null ? item.getSubtotal() : 0.0;
                })
                .sum();
    }

   
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }

    public LocalDateTime getFecha() { return fecha; }
    public void setFecha(LocalDateTime fecha) { this.fecha = fecha; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public Double getTotal() { return total; }
    public void setTotal(Double total) { this.total = total; }

    public List<ItemPedido> getItems() { return items; }
    public void setItems(List<ItemPedido> items) { 
        this.items = items; 
        this.calcularTotal();
    }
}
