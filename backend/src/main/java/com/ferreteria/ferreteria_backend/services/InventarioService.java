package com.ferreteria.ferreteria_backend.services;

import com.ferreteria.ferreteria_backend.entities.Producto;
import com.ferreteria.ferreteria_backend.repositories.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;

@Service
public class InventarioService {

    @Autowired
    private ProductoRepository productoRepository;

    @Transactional
    public void descontarStock(Integer idProducto, BigDecimal cantidadVendida) {
        Producto producto = productoRepository.findById(idProducto)
            .orElseThrow(() -> new RuntimeException("Error: Producto no encontrado"));
            
        // Validamos que haya suficiente stock
        if (producto.getStockTotal().compareTo(cantidadVendida) < 0) {
            throw new RuntimeException("¡Pum! Stock insuficiente para el producto: " + producto.getNombre());
        }
        
        // Restamos la cantidad
        producto.setStockTotal(producto.getStockTotal().subtract(cantidadVendida));
        productoRepository.save(producto);
    }

    @Transactional
    public void agregarStock(Integer idProducto, BigDecimal cantidadEntrante) {
        Producto producto = productoRepository.findById(idProducto)
            .orElseThrow(() -> new RuntimeException("Error: Producto no encontrado"));
            
        // Sumamos la cantidad
        producto.setStockTotal(producto.getStockTotal().add(cantidadEntrante));
        productoRepository.save(producto);
    }
}