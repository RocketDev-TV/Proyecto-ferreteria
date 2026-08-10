package com.ferreteria.ferreteria_backend.controllers;

import com.ferreteria.ferreteria_backend.entities.Producto;
import com.ferreteria.ferreteria_backend.repositories.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "*")
public class ProductoController {
    @Autowired private ProductoRepository repository;
    @GetMapping public List<Producto> obtenerTodos() { return repository.findAll(); }
}