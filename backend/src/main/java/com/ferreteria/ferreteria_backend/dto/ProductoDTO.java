package com.ferreteria.ferreteria_backend.dto;

import java.math.BigDecimal;

// Un Record es un DTO inmutable, perfecto para recibir datos limpios
public record ProductoDTO(
    Integer idCategoria,
    String nombre,
    String descripcion,
    BigDecimal precioVentaAct,
    BigDecimal stockTotal
) {}