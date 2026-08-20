package com.ferreteria.ferreteria_backend.controllers;

import com.ferreteria.ferreteria_backend.entities.Proveedor;
import com.ferreteria.ferreteria_backend.repositories.ProveedorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/proveedores")
@CrossOrigin(origins = "*")
public class ProveedorController {

    @Autowired
    private ProveedorRepository proveedorRepository;

    @GetMapping
    public List<Proveedor> obtenerTodos() {
        return proveedorRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<Proveedor> crearProveedor(@RequestBody Proveedor proveedor) {
        return ResponseEntity.ok(proveedorRepository.save(proveedor));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Proveedor> actualizarProveedor(@PathVariable Integer id, @RequestBody Proveedor detalles) {
        return proveedorRepository.findById(id)
                .map(prov -> {
                    prov.setNombre(detalles.getNombre());
                    prov.setNumero(detalles.getNumero());
                    prov.setCorreo(detalles.getCorreo());
                    prov.setDireccion(detalles.getDireccion());
                    return ResponseEntity.ok(proveedorRepository.save(prov));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}