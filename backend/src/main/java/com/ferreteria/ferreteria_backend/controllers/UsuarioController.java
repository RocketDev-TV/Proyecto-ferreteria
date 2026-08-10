package com.ferreteria.ferreteria_backend.controllers;

import com.ferreteria.ferreteria_backend.dto.UsuarioDTO;
import com.ferreteria.ferreteria_backend.entities.Rol;
import com.ferreteria.ferreteria_backend.entities.Usuario;
import com.ferreteria.ferreteria_backend.repositories.RolRepository;
import com.ferreteria.ferreteria_backend.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {
    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private RolRepository rolRepository;

    @GetMapping public List<Usuario> obtenerTodos() { return usuarioRepository.findAll(); }

    @PostMapping
    public ResponseEntity<Usuario> crearUsuario(@RequestBody UsuarioDTO dto) {
        Rol rolAsignado = rolRepository.findById(dto.idRol())
            .orElseThrow(() -> new RuntimeException("Error: Rol no existe"));
            
        Usuario nuevoUsuario = new Usuario();
        nuevoUsuario.setRol(rolAsignado);
        nuevoUsuario.setNombreCompleto(dto.nombreCompleto());
        nuevoUsuario.setNombreUsuario(dto.nombreUsuario());
        nuevoUsuario.setContrasena(dto.contrasena());
        
        return ResponseEntity.ok(usuarioRepository.save(nuevoUsuario));
    }
}