package com.ferreteria.ferreteria_backend.dto;
import java.math.BigDecimal;

public record LoteAlmacenDTO(
    Integer idProducto, 
    Integer idProveedor, 
    BigDecimal cantidadInicial, 
    BigDecimal cantidadDisponible, 
    BigDecimal precioCompra
) {}