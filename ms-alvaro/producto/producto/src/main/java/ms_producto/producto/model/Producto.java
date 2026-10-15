
package ms_producto.producto.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import ms_producto.producto.enums.CategoriaProducto;

@Entity
@Table(name = "productos")
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 100, message = "El nombre no puede superar los 100 caracteres")
    @Column(nullable = false, length = 100)
    private String nombre;

    @NotBlank(message = "La descripción es obligatoria")
    @Column(nullable = false)
    private String descripcion;

    @NotNull(message = "El precio es obligatorio")
    @DecimalMin(value = "0.01", message = "El precio debe ser mayor que cero")
    @Column(nullable = false)
    private Double precio;

    @NotNull(message = "La categoría es obligatoria")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CategoriaProducto categoria;

    @NotNull(message = "El stock es obligatorio")
    @Min(value = 0, message = "El stock no puede ser negativo")
    @Column(nullable = false)
    private Integer stock = 0;

    @NotNull(message = "El stock mínimo es obligatorio")
    @Min(value = 0, message = "El stock mínimo no puede ser negativo")
    @Column(nullable = false)
    private Integer stockMinimo = 0;

    // CONSTRUCTOR VACÍO
    public Producto() {
    }

    // CONSTRUCTOR SIN STOCK
    public Producto(
            String nombre,
            String descripcion,
            Double precio,
            CategoriaProducto categoria) {

        this.nombre = nombre;
        this.descripcion = descripcion;
        this.precio = precio;
        this.categoria = categoria;
    }

    // CONSTRUCTOR CON STOCK
    public Producto(
            String nombre,
            String descripcion,
            Double precio,
            CategoriaProducto categoria,
            Integer stock,
            Integer stockMinimo) {

        this(nombre, descripcion, precio, categoria);
        setStock(stock);
        setStockMinimo(stockMinimo);
    }

    // MÉTODOS DE INVENTARIO
    public boolean tieneStock(Integer cantidad) {
        return cantidad != null
                && cantidad > 0
                && stock != null
                && stock >= cantidad;
    }

    public boolean tieneStockBajo() {
        return stock != null
                && stockMinimo != null
                && stock <= stockMinimo;
    }

    // GETTERS Y SETTERS
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

    public CategoriaProducto getCategoria() {
        return categoria;
    }

    public void setCategoria(CategoriaProducto categoria) {
        if (categoria == null) {
            throw new IllegalArgumentException(
                    "La categoría no puede ser nula.");
        }
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
