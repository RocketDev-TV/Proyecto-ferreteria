package com.ferreteria.ferreteria_backend.dto;
import java.math.BigDecimal;

public record DetalleVentaDTO(
    Integer idVenta, 
    Integer idProducto, 
    BigDecimal cantidad, 
    BigDecimal precioUnitario, 
    BigDecimal precioCompraHistorico, 
    BigDecimal subtotal
) {}