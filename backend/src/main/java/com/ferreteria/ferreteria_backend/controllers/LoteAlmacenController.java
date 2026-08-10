package com.ferreteria.ferreteria_backend.controllers;

import com.ferreteria.ferreteria_backend.dto.LoteAlmacenDTO;
import com.ferreteria.ferreteria_backend.entities.LoteAlmacen;
import com.ferreteria.ferreteria_backend.entities.Producto;
import com.ferreteria.ferreteria_backend.entities.Proveedor;
import com.ferreteria.ferreteria_backend.repositories.LoteAlmacenRepository;
import com.ferreteria.ferreteria_backend.repositories.ProductoRepository;
import com.ferreteria.ferreteria_backend.repositories.ProveedorRepository;
import com.ferreteria.ferreteria_backend.services.InventarioService; // <-- EL IMPORT SALVADOR
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/lotes")
@CrossOrigin(origins = "*")
public class LoteAlmacenController {
    
    @Autowired private LoteAlmacenRepository loteRepository;
    @Autowired private ProductoRepository productoRepository;
    @Autowired private ProveedorRepository proveedorRepository;
    @Autowired private InventarioService inventarioService;

    @GetMapping 
    public List<LoteAlmacen> obtenerTodos() { 
        return loteRepository.findAll(); 
    }

    @PostMapping
    public ResponseEntity<LoteAlmacen> crearLote(@RequestBody LoteAlmacenDTO dto) {
        Producto prod = productoRepository.findById(dto.idProducto()).orElseThrow();
        Proveedor prov = proveedorRepository.findById(dto.idProveedor()).orElseThrow();
        
        // 1. Sumamos stock
        inventarioService.agregarStock(dto.idProducto(), dto.cantidadInicial());
        
        // 2. Guardamos el lote
        LoteAlmacen lote = new LoteAlmacen();
        lote.setProducto(prod);
        lote.setProveedor(prov);
        lote.setCantidadInicial(dto.cantidadInicial());
        lote.setCantidadDisponible(dto.cantidadDisponible());
        lote.setPrecioCompra(dto.precioCompra());
        
        return ResponseEntity.ok(loteRepository.save(lote));
    }
}