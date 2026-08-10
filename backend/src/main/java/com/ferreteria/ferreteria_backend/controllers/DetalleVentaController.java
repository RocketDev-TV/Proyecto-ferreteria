package com.ferreteria.ferreteria_backend.controllers;

import com.ferreteria.ferreteria_backend.dto.DetalleVentaDTO;
import com.ferreteria.ferreteria_backend.entities.DetalleVenta;
import com.ferreteria.ferreteria_backend.entities.HistorialVenta;
import com.ferreteria.ferreteria_backend.entities.Producto;
import com.ferreteria.ferreteria_backend.repositories.DetalleVentaRepository;
import com.ferreteria.ferreteria_backend.repositories.HistorialVentaRepository;
import com.ferreteria.ferreteria_backend.repositories.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/ventas/detalles")
@CrossOrigin(origins = "*")
public class DetalleVentaController {
    @Autowired private DetalleVentaRepository detalleRepository;
    @Autowired private HistorialVentaRepository ventaRepository;
    @Autowired private ProductoRepository productoRepository;

    @GetMapping public List<DetalleVenta> obtenerTodos() { return detalleRepository.findAll(); }

    @PostMapping
    public ResponseEntity<DetalleVenta> crearDetalle(@RequestBody DetalleVentaDTO dto) {
        HistorialVenta venta = ventaRepository.findById(dto.idVenta()).orElseThrow();
        Producto producto = productoRepository.findById(dto.idProducto()).orElseThrow();
        
        DetalleVenta detalle = new DetalleVenta();
        detalle.setVenta(venta);
        detalle.setProducto(producto);
        detalle.setCantidad(dto.cantidad());
        detalle.setPrecioUnitario(dto.precioUnitario());
        detalle.setPrecioCompraHistorico(dto.precioCompraHistorico());
        detalle.setSubtotal(dto.subtotal());
        
        return ResponseEntity.ok(detalleRepository.save(detalle));
    }
}