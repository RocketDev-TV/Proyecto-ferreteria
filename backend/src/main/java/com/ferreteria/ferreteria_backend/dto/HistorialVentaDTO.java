package com.ferreteria.ferreteria_backend.dto;
import java.math.BigDecimal;

public record HistorialVentaDTO(
    Integer idUsuario, 
    BigDecimal totalVenta
) {}