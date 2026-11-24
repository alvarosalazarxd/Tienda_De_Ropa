
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
    @Column(nullable = false, length = 30, columnDefinition = "VARCHAR(30)")
    private EstadoPedido estado = EstadoPedido.PENDIENTE;

    @Column(nullable = false)
    private Double total = 0.0;

    @Column(name = "metodo_pago", length = 80)
    private String metodoPago;

    @Column(name = "cliente_nombre", length = 150)
    private String clienteNombre;

    @Column(name = "cliente_email", length = 150)
    private String clienteEmail;

    @Column(name = "cliente_telefono", length = 40)
    private String clienteTelefono;

    @Column(length = 255)
    private String direccion;

    @Column(name = "comuna_region", length = 255)
    private String comunaRegion;

    @Column(name = "motivo_estado", length = 255)
    private String motivoEstado;

    @Column(name = "monto_reembolsado")
    private Double montoReembolsado = 0.0;

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

    public boolean estaPagado() {
        return estado == EstadoPedido.PAGADO
                || estado == EstadoPedido.PREPARANDO
                || estado == EstadoPedido.ENVIADO
                || estado == EstadoPedido.ENTREGADO;
    }

    public boolean puedeCambiarA(EstadoPedido destino) {
        if (destino == null || destino == estado) {
            return false;
        }
        return switch (estado) {
            case PENDIENTE -> destino == EstadoPedido.PAGADO
                    || destino == EstadoPedido.CANCELADO;
            case PAGADO -> destino == EstadoPedido.PREPARANDO
                    || destino == EstadoPedido.ENVIADO
                    || destino == EstadoPedido.ENTREGADO
                    || destino == EstadoPedido.REEMBOLSADO;
            case PREPARANDO -> destino == EstadoPedido.ENVIADO
                    || destino == EstadoPedido.ENTREGADO
                    || destino == EstadoPedido.REEMBOLSADO;
            case ENVIADO -> destino == EstadoPedido.ENTREGADO
                    || destino == EstadoPedido.REEMBOLSADO;
            case ENTREGADO -> destino == EstadoPedido.REEMBOLSADO;
            case CANCELADO, REEMBOLSADO -> false;
        };
    }

    public void cancelar() {

        if (estaPagado()) {
            throw new IllegalStateException(
                    "No se puede cancelar un pedido pagado; debes procesarlo como REEMBOLSADO."
            );
        }

        if (estado == EstadoPedido.CANCELADO) {
            throw new IllegalStateException(
                    "El pedido ya está cancelado."
            );
        }

        if (estado == EstadoPedido.REEMBOLSADO) {
            throw new IllegalStateException(
                    "El pedido ya está reembolsado."
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

    public void marcarComoReembolsado(String motivo) {
        if (!estaPagado()) {
            throw new IllegalStateException(
                    "Solo se pueden reembolsar pedidos que ya fueron pagados."
            );
        }

        String motivoFinal = (motivo != null && !motivo.isBlank())
                ? motivo.trim()
                : "Reembolso procesado por administración";

        for (ItemPedido item : items) {
            if (!item.estaReembolsado()) {
                item.setReembolsado(true);
                item.setMotivoReembolso(motivoFinal);
            }
        }

        this.montoReembolsado = this.total != null ? this.total : 0.0;
        this.motivoEstado = motivoFinal;
        this.estado = EstadoPedido.REEMBOLSADO;
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

    public void recalcularTotalActivos() {
        this.total = items.stream()
                .filter(item -> !item.estaReembolsado())
                .mapToDouble(item -> {
                    item.calcularSubtotal();
                    return item.getSubtotal() != null ? item.getSubtotal() : 0.0;
                })
                .sum();
    }

    public void recalcularMontoReembolsado() {
        double suma = items.stream()
                .filter(ItemPedido::estaReembolsado)
                .mapToDouble(item -> {
                    item.calcularSubtotal();
                    return item.getSubtotal() != null ? item.getSubtotal() : 0.0;
                })
                .sum();
        double tope = this.total != null ? this.total : suma;
        this.montoReembolsado = Math.min(suma, tope);
    }

    public boolean todosLosItemsReembolsados() {
        return !items.isEmpty() && items.stream().allMatch(ItemPedido::estaReembolsado);
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

    public String getMetodoPago() {
        return metodoPago;
    }

    public void setMetodoPago(String metodoPago) {
        this.metodoPago = metodoPago;
    }

    public String getClienteNombre() {
        return clienteNombre;
    }

    public void setClienteNombre(String clienteNombre) {
        this.clienteNombre = clienteNombre;
    }

    public String getClienteEmail() {
        return clienteEmail;
    }

    public void setClienteEmail(String clienteEmail) {
        this.clienteEmail = clienteEmail;
    }

    public String getClienteTelefono() {
        return clienteTelefono;
    }

    public void setClienteTelefono(String clienteTelefono) {
        this.clienteTelefono = clienteTelefono;
    }

    public String getDireccion() {
        return direccion;
    }

    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }

    public String getComunaRegion() {
        return comunaRegion;
    }

    public void setComunaRegion(String comunaRegion) {
        this.comunaRegion = comunaRegion;
    }

    public String getMotivoEstado() {
        return motivoEstado;
    }

    public void setMotivoEstado(String motivoEstado) {
        this.motivoEstado = motivoEstado;
    }

    public Double getMontoReembolsado() {
        return montoReembolsado != null ? montoReembolsado : 0.0;
    }

    public void setMontoReembolsado(Double montoReembolsado) {
        this.montoReembolsado = montoReembolsado != null && montoReembolsado >= 0
                ? montoReembolsado
                : 0.0;
    }
}
