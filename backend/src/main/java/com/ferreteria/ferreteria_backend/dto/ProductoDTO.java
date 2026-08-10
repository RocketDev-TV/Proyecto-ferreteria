package com.ferreteria.ferreteria_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;

public record ProductoDTO(
    @NotNull(message = "El ID de la categoría es obligatorio") 
    Integer idCategoria,
    
    @NotBlank(message = "El nombre del producto no puede estar vacío") 
    String nombre,
    
    String descripcion,
    
    @NotNull(message = "El precio es obligatorio") 
    @Positive(message = "El precio debe ser mayor a 0") 
    BigDecimal precioVentaAct,
    
    @NotNull(message = "El stock es obligatorio") 
    @PositiveOrZero(message = "El stock no puede ser negativo") 
    BigDecimal stockTotal
) {}