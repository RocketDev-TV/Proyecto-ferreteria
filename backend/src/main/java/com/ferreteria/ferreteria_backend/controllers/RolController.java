package com.ferreteria.ferreteria_backend.controllers;

import com.ferreteria.ferreteria_backend.entities.Rol;
import com.ferreteria.ferreteria_backend.repositories.RolRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/roles")
@CrossOrigin(origins = "*")
public class RolController {
    @Autowired private RolRepository repository;
    @GetMapping public List<Rol> obtenerTodos() { return repository.findAll(); }
}