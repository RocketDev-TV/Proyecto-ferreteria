package com.ferreteria.ferreteria_backend.controllers;

import com.ferreteria.ferreteria_backend.entities.HistorialVenta;
import com.ferreteria.ferreteria_backend.repositories.HistorialVentaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/ventas")
@CrossOrigin(origins = "*")
public class HistorialVentaController {
    @Autowired private HistorialVentaRepository repository;
    @GetMapping public List<HistorialVenta> obtenerTodos() { return repository.findAll(); }
}