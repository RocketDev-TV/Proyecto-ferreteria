package com.ferreteria.ferreteria_backend.controllers;

import com.ferreteria.ferreteria_backend.dto.ProductoDTO;
import com.ferreteria.ferreteria_backend.entities.Categoria;
import com.ferreteria.ferreteria_backend.entities.Producto;
import com.ferreteria.ferreteria_backend.repositories.CategoriaRepository;
import com.ferreteria.ferreteria_backend.repositories.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "*")
public class ProductoController {

    @Autowired 
    private ProductoRepository productoRepository;
    
    @Autowired 
    private CategoriaRepository categoriaRepository;

    // ==========================================
    // GET: OBTENER PRODUCTOS PAGINADOS
    // ==========================================
    @GetMapping 
    public Page<Producto> obtenerTodos(@PageableDefault(size = 10) Pageable pageable) { 
        // El findAll(pageable) hace la magia del LIMIT y OFFSET en Postgres automáticamente
        return productoRepository.findAll(pageable); 
    }

    @PostMapping
    public ResponseEntity<Producto> crearProducto(@Valid @RequestBody ProductoDTO dto) {        
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

    // ==========================================
    // PUT: ACTUALIZAR UN PRODUCTO EXISTENTE
    // ==========================================
    @PutMapping("/{id}")
    public ResponseEntity<Producto> actualizarProducto(@PathVariable Integer id, @Valid @RequestBody ProductoDTO dto) {
        // 1. Buscamos si el producto existe
        Producto productoExistente = productoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Error: Producto no encontrado"));

        // 2. Buscamos la categoría nueva (o la misma)
        Categoria categoriaAsignada = categoriaRepository.findById(dto.idCategoria())
            .orElseThrow(() -> new RuntimeException("Error: La categoría no existe"));

        // 3. Actualizamos los datos
        productoExistente.setCategoria(categoriaAsignada);
        productoExistente.setNombre(dto.nombre());
        productoExistente.setDescripcion(dto.descripcion());
        productoExistente.setPrecioVentaAct(dto.precioVentaAct());
        productoExistente.setStockTotal(dto.stockTotal());

        // 4. Guardamos los cambios
        return ResponseEntity.ok(productoRepository.save(productoExistente));
    }

    // ==========================================
    // DELETE: ELIMINAR UN PRODUCTO
    // ==========================================
    @DeleteMapping("/{id}")
    public ResponseEntity<String> eliminarProducto(@PathVariable Integer id) {
        // Validamos que exista antes de intentar borrarlo
        productoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Error: Producto no encontrado"));
            
        productoRepository.deleteById(id);
        return ResponseEntity.ok("Producto eliminado con éxito");
    }
}