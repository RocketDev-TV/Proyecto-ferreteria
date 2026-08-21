package com.ferreteria.ferreteria_backend.controllers;

import com.ferreteria.ferreteria_backend.dto.UsuarioDTO;
import com.ferreteria.ferreteria_backend.entities.Rol;
import com.ferreteria.ferreteria_backend.entities.Usuario;
import com.ferreteria.ferreteria_backend.repositories.RolRepository;
import com.ferreteria.ferreteria_backend.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {
    
    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private RolRepository rolRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    // LEER USUARIOS
    @GetMapping 
    public List<Usuario> obtenerTodos() { 
        return usuarioRepository.findAll(); 
    }

    // CREAR USUARIO
    @PostMapping
    public ResponseEntity<Usuario> crearUsuario(@RequestBody UsuarioDTO dto) {
        Rol rolAsignado = rolRepository.findById(dto.idRol())
            .orElseThrow(() -> new RuntimeException("Error: Rol no existe"));
            
        Usuario nuevoUsuario = new Usuario();
        nuevoUsuario.setRol(rolAsignado);
        nuevoUsuario.setNombreCompleto(dto.nombreCompleto());
        nuevoUsuario.setNombreUsuario(dto.nombreUsuario());
        nuevoUsuario.setContrasena(passwordEncoder.encode(dto.contrasena()));
        
        return ResponseEntity.ok(usuarioRepository.save(nuevoUsuario));
    }

    // ACTUALIZAR USUARIO (¡El que faltaba!)
    @PutMapping("/{id}")
    public ResponseEntity<Usuario> actualizarUsuario(@PathVariable Integer id, @RequestBody UsuarioDTO dto) {
        return usuarioRepository.findById(id)
            .map(usuarioExistente -> {
                usuarioExistente.setNombreCompleto(dto.nombreCompleto());
                usuarioExistente.setNombreUsuario(dto.nombreUsuario());

                Rol rolAsignado = rolRepository.findById(dto.idRol())
                    .orElseThrow(() -> new RuntimeException("Error: Rol no existe"));
                usuarioExistente.setRol(rolAsignado);

                // Si la contraseña no viene nula ni vacía, la encriptamos y la cambiamos
                if (dto.contrasena() != null && !dto.contrasena().isEmpty()) {
                    usuarioExistente.setContrasena(passwordEncoder.encode(dto.contrasena()));
                }

                return ResponseEntity.ok(usuarioRepository.save(usuarioExistente));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    // ELIMINAR USUARIO (¡Para que tampoco te falle el botón rojo!)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarUsuario(@PathVariable Integer id) {
        if (usuarioRepository.existsById(id)) {
            usuarioRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}