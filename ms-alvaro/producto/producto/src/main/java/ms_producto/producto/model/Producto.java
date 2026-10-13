package ms_producto.producto.model;

import jakarta.persistence.*;

@Entity
@Table(name = "productos")
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private String descripcion;
    private Double precio;
    private String categoria;

    @Column(nullable = false)
    private Integer stock = 0;

    @Column(nullable = false)
    private Integer stockMinimo = 0;

    public Producto() {
    }

    public Producto(
            String nombre,
            String descripcion,
            Double precio,
            String categoria) {
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.precio = precio;
        this.categoria = categoria;
    }

    public Producto(
            String nombre,
            String descripcion,
            Double precio,
            String categoria,
            Integer stock,
            Integer stockMinimo) {
        this(nombre, descripcion, precio, categoria);
        setStock(stock);
        setStockMinimo(stockMinimo);
    }

    public boolean tieneStock(Integer cantidad) {
        return cantidad != null
                && cantidad > 0
                && stock >= cantidad;
    }

    public boolean tieneStockBajo() {
        return stock <= stockMinimo;
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

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public Double getPrecio() {
        return precio;
    }

    public void setPrecio(Double precio) {
        this.precio = precio;
    }

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public Integer getStock() {
        return stock;
    }

    public void setStock(Integer stock) {
        if (stock == null || stock < 0) {
            throw new IllegalArgumentException(
                    "El stock no puede ser nulo ni negativo.");
        }

        this.stock = stock;
    }

    public Integer getStockMinimo() {
        return stockMinimo;
    }

    public void setStockMinimo(Integer stockMinimo) {
        if (stockMinimo == null || stockMinimo < 0) {
            throw new IllegalArgumentException(
                    "El stock mínimo no puede ser nulo ni negativo.");
        }

        this.stockMinimo = stockMinimo;
    }
}