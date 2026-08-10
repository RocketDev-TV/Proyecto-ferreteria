package com.ferreteria.ferreteria_backend.controllers;

import com.ferreteria.ferreteria_backend.dto.AuthDTO;
import com.ferreteria.ferreteria_backend.repositories.UsuarioRepository;
import com.ferreteria.ferreteria_backend.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody AuthDTO dto) {
        return usuarioRepository.findByNombreUsuario(dto.nombreUsuario())
            // Compara la contraseña en texto plano del DTO contra el Hash de la BD
            .filter(u -> passwordEncoder.matches(dto.contrasena(), u.getContrasena()))
            .map(u -> ResponseEntity.ok(jwtUtil.generarToken(u.getNombreUsuario())))
            .orElseGet(() -> ResponseEntity.status(401).body("Credenciales incorrectas"));
    }
}