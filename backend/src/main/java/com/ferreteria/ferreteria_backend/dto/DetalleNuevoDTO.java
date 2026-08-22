package com.ferreteria.ferreteria_backend.dtos;

import java.math.BigDecimal;

public class DetalleNuevoDTO {
    
    private Integer idProducto;
    private BigDecimal cantidad;
    private BigDecimal precioUnitario;

    public DetalleNuevoDTO() {
    }

    // --- Getters y Setters ---
    public Integer getIdProducto() {
        return idProducto;
    }

    public void setIdProducto(Integer idProducto) {
        this.idProducto = idProducto;
    }

    public BigDecimal getCantidad() {
        return cantidad;
    }

    public void setCantidad(BigDecimal cantidad) {
        this.cantidad = cantidad;
    }

    public BigDecimal getPrecioUnitario() {
        return precioUnitario;
    }

    public void setPrecioUnitario(BigDecimal precioUnitario) {
        this.precioUnitario = precioUnitario;
    }
}