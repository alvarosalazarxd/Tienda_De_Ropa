package ms_carrito.carrito.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "carritos")
public class Carrito {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long usuarioId;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "carrito_id")
    private List<ItemCarrito> items = new ArrayList<>();

    private Double total = 0.0;

    public Carrito() {}

    public Carrito(Long usuarioId) {
        this.usuarioId = usuarioId;
    }

    public void calcularTotal() {
        this.total = 0.0;
        if (this.items != null) {
            for (ItemCarrito item : this.items) {
                item.calcularSubtotal();
                this.total += item.getSubtotal();
            }
        }
    }

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }

    public List<ItemCarrito> getItems() { return items; }
    public void setItems(List<ItemCarrito> items) { 
        this.items = items; 
        this.calcularTotal();
    }

    public Double getTotal() { return total; }
    public void setTotal(Double total) { this.total = total; }
}
