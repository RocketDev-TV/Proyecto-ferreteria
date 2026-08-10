package com.ferreteria.ferreteria_backend.controllers;

import com.ferreteria.ferreteria_backend.dto.ProductoDTO;
import com.ferreteria.ferreteria_backend.entities.Categoria;
import com.ferreteria.ferreteria_backend.entities.Producto;
import com.ferreteria.ferreteria_backend.repositories.CategoriaRepository;
import com.ferreteria.ferreteria_backend.repositories.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "*")
public class ProductoController {

    @Autowired 
    private ProductoRepository productoRepository;
    
    @Autowired 
    private CategoriaRepository categoriaRepository;

    @GetMapping 
    public List<Producto> obtenerTodos() { 
        return productoRepository.findAll(); 
    }

    @PostMapping
    public ResponseEntity<Producto> crearProducto(@RequestBody ProductoDTO dto) {
        // 1. Buscamos la categoría por el ID que nos mandó el DTO
        Categoria categoriaAsignada = categoriaRepository.findById(dto.idCategoria())
            .orElseThrow(() -> new RuntimeException("Error: La categoría no existe"));

        // 2. Creamos la entidad vacía y la llenamos
        Producto nuevoProducto = new Producto();
        nuevoProducto.setCategoria(categoriaAsignada);
        nuevoProducto.setNombre(dto.nombre());
        nuevoProducto.setDescripcion(dto.descripcion());
        nuevoProducto.setPrecioVentaAct(dto.precioVentaAct());
        nuevoProducto.setStockTotal(dto.stockTotal());

        // 3. Guardamos y respondemos con un 200 OK
        return ResponseEntity.ok(productoRepository.save(nuevoProducto));
    }
}