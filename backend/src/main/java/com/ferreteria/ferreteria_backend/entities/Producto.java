package com.ferreteria.ferreteria_backend.entities;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "Productos")
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_producto")
    private Integer idProducto;

    // Mapeo de la llave foránea fk_categoria
    @ManyToOne
    @JoinColumn(name = "id_categoria", nullable = false)
    private Categoria categoria;

    @Column(name = "nombre", nullable = false, length = 70)
    private String nombre;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "precio_venta_act", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioVentaAct;

    @Column(name = "stock_total", nullable = false, precision = 10, scale = 3)
    private BigDecimal stockTotal;

    public Producto() {}

    // Getters y Setters
    public Integer getIdProducto() { return idProducto; }
    public void setIdProducto(Integer idProducto) { this.idProducto = idProducto; }
    public Categoria getCategoria() { return categoria; }
    public void setCategoria(Categoria categoria) { this.categoria = categoria; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public BigDecimal getPrecioVentaAct() { return precioVentaAct; }
    public void setPrecioVentaAct(BigDecimal precioVentaAct) { this.precioVentaAct = precioVentaAct; }
    public BigDecimal getStockTotal() { return stockTotal; }
    public void setStockTotal(BigDecimal stockTotal) { this.stockTotal = stockTotal; }
}