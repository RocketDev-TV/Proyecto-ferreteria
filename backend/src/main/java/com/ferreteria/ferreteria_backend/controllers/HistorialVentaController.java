package com.ferreteria.ferreteria_backend.controllers;

import com.ferreteria.ferreteria_backend.dto.HistorialVentaDTO;
import com.ferreteria.ferreteria_backend.entities.HistorialVenta;
import com.ferreteria.ferreteria_backend.entities.Usuario;
import com.ferreteria.ferreteria_backend.repositories.HistorialVentaRepository;
import com.ferreteria.ferreteria_backend.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/ventas")
@CrossOrigin(origins = "*")
public class HistorialVentaController {
    @Autowired private HistorialVentaRepository ventaRepository;
    @Autowired private UsuarioRepository usuarioRepository;

    @GetMapping public List<HistorialVenta> obtenerTodos() { return ventaRepository.findAll(); }

    @PostMapping
    public ResponseEntity<HistorialVenta> crearVenta(@RequestBody HistorialVentaDTO dto) {
        Usuario cajero = usuarioRepository.findById(dto.idUsuario()).orElseThrow();
        
        HistorialVenta venta = new HistorialVenta();
        venta.setUsuario(cajero);
        venta.setTotalVenta(dto.totalVenta());
        
        return ResponseEntity.ok(ventaRepository.save(venta));
    }
}