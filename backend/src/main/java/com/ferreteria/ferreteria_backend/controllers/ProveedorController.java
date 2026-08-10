package com.ferreteria.ferreteria_backend.controllers;

import com.ferreteria.ferreteria_backend.entities.Proveedor;
import com.ferreteria.ferreteria_backend.repositories.ProveedorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/proveedores")
@CrossOrigin(origins = "*")
public class ProveedorController {
    @Autowired private ProveedorRepository repository;
    @GetMapping public List<Proveedor> obtenerTodos() { return repository.findAll(); }
}