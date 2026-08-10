package com.ferreteria.ferreteria_backend.dto;

public record UsuarioDTO(
    Integer idRol, 
    String nombreCompleto, 
    String nombreUsuario, 
    String contrasena
) {}