package com.ferreteria.ferreteria_backend.controllers;

import com.ferreteria.ferreteria_backend.entities.LoteAlmacen;
import com.ferreteria.ferreteria_backend.repositories.LoteAlmacenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/lotes")
@CrossOrigin(origins = "*")
public class LoteAlmacenController {
    @Autowired private LoteAlmacenRepository repository;
    @GetMapping public List<LoteAlmacen> obtenerTodos() { return repository.findAll(); }
}