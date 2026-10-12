package ms_inventario.inventario.model;

import jakarta.persistence.*;

@Entity
@Table(name = "inventarios")
public class Inventario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long productoId;
    private Integer stock;
    private Integer stockMinimo;

    public Inventario() {}

    public Inventario(Long productoId, Integer stock, Integer stockMinimo) {
        this.productoId = productoId;
        this.stock = stock;
        this.stockMinimo = stockMinimo;
    }

    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProductoId() { return productoId; }
    public void setProductoId(Long productoId) { this.productoId = productoId; }

    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }

    public Integer getStockMinimo() { return stockMinimo; }
    public void setStockMinimo(Integer stockMinimo) { this.stockMinimo = stockMinimo; }
}