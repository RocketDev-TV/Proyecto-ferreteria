package com.ferreteria.ferreteria_backend.controllers;

import com.ferreteria.ferreteria_backend.dto.AuthDTO;
import com.ferreteria.ferreteria_backend.repositories.UsuarioRepository;
import com.ferreteria.ferreteria_backend.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthDTO dto) { // Cambiamos <String> por <?>
        return usuarioRepository.findByNombreUsuario(dto.nombreUsuario())
            .filter(u -> passwordEncoder.matches(dto.contrasena(), u.getContrasena()))
            .map(u -> {
                // Armamos el paquete JSON que React está esperando
                Map<String, String> response = new HashMap<>();
                response.put("token", jwtUtil.generarToken(u.getNombreUsuario()));
                response.put("nombreCompleto", u.getNombreCompleto());
                response.put("rol", u.getRol().getTipoRol());
                
                return ResponseEntity.ok(response);
            })
            .orElseGet(() -> {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Credenciales incorrectas");
                return ResponseEntity.status(401).body(error);
            });
    }
}