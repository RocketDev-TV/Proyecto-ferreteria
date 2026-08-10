package com.ferreteria.ferreteria_backend.controllers;

import com.ferreteria.ferreteria_backend.dto.AuthDTO;
import com.ferreteria.ferreteria_backend.repositories.UsuarioRepository;
import com.ferreteria.ferreteria_backend.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody AuthDTO dto) {
        return usuarioRepository.findByNombreUsuario(dto.nombreUsuario())
            // Compara contraseñas (en un sistema 100% prod aquí iría BCrypt)
            .filter(u -> u.getContrasena().equals(dto.contrasena()))
            // Si todo cuadra, regresa el Token
            .map(u -> ResponseEntity.ok(jwtUtil.generarToken(u.getNombreUsuario())))
            // Si no cuadra, batea con un 401
            .orElseGet(() -> ResponseEntity.status(401).body("Credenciales incorrectas"));
    }
}