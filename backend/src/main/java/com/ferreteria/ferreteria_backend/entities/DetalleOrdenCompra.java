package com.ferreteria.ferreteria_backend.entities;

import jakarta.persistence.*;
import java.math.BigDecimal;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "Detalle_ordenes_compra")
public class DetalleOrdenCompra {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_detalle_orden")
    private Integer idDetalleOrden;

    @ManyToOne
    @JoinColumn(name = "id_orden", nullable = false)
    @JsonIgnore // ¡Crítico para evitar un bucle infinito al generar el JSON!
    private OrdenCompra ordenCompra;

    @ManyToOne
    @JoinColumn(name = "id_producto", nullable = false)
    private Producto producto;

    @Column(name = "cantidad_solicitada", nullable = false)
    private BigDecimal cantidadSolicitada;

    @Column(name = "cantidad_recibida", nullable = false)
    private BigDecimal cantidadRecibida = BigDecimal.ZERO;

    @Column(name = "precio_unitario_esperado", nullable = false)
    private BigDecimal precioUnitarioEsperado;

    @Column(nullable = false)
    private BigDecimal subtotal;

    // Getters y Setters
    public Integer getIdDetalleOrden() { return idDetalleOrden; }
    public void setIdDetalleOrden(Integer idDetalleOrden) { this.idDetalleOrden = idDetalleOrden; }
    public OrdenCompra getOrdenCompra() { return ordenCompra; }
    public void setOrdenCompra(OrdenCompra ordenCompra) { this.ordenCompra = ordenCompra; }
    public Producto getProducto() { return producto; }
    public void setProducto(Producto producto) { this.producto = producto; }
    public BigDecimal getCantidadSolicitada() { return cantidadSolicitada; }
    public void setCantidadSolicitada(BigDecimal cantidadSolicitada) { this.cantidadSolicitada = cantidadSolicitada; }
    public BigDecimal getCantidadRecibida() { return cantidadRecibida; }
    public void setCantidadRecibida(BigDecimal cantidadRecibida) { this.cantidadRecibida = cantidadRecibida; }
    public BigDecimal getPrecioUnitarioEsperado() { return precioUnitarioEsperado; }
    public void setPrecioUnitarioEsperado(BigDecimal precioUnitarioEsperado) { this.precioUnitarioEsperado = precioUnitarioEsperado; }
    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }
}