package com.ferreteria.ferreteria_backend.controllers;

import com.ferreteria.ferreteria_backend.entities.DetalleVenta;
import com.ferreteria.ferreteria_backend.repositories.DetalleVentaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/ventas/detalles")
@CrossOrigin(origins = "*")
public class DetalleVentaController {
    @Autowired private DetalleVentaRepository repository;
    @GetMapping public List<DetalleVenta> obtenerTodos() { return repository.findAll(); }
}