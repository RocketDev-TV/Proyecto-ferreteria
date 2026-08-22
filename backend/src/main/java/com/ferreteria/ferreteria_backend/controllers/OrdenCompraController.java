package com.ferreteria.ferreteria_backend.controllers;

import com.ferreteria.ferreteria_backend.entities.*;
import com.ferreteria.ferreteria_backend.repositories.*;
import com.ferreteria.ferreteria_backend.dtos.*; // ¡Aquí importamos tus nuevos DTOs!

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

// ¡Aquí importamos las herramientas nativas de Java que faltaban!
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ordenes")
@CrossOrigin(origins = "*")
public class OrdenCompraController {

    @Autowired private OrdenCompraRepository ordenRepo;
    @Autowired private LoteAlmacenRepository loteRepo;
    @Autowired private ProductoRepository productoRepo;
    
    // ¡Aquí inyectamos el repo del proveedor que nos pedía el compilador!
    @Autowired private ProveedorRepository proveedorRepo; 

    // Endpoint para poblar el Frontend (Pestaña "Órdenes en Tránsito")
    @GetMapping("/pendientes")
    public List<OrdenCompra> obtenerPendientes() {
        return ordenRepo.findByEstado("ENVIADA");
    }

    // EL MOTOR DE AUTOMATIZACIÓN (RECIBIR ORDEN)
    @PostMapping("/{id}/recibir")
    @Transactional
    public ResponseEntity<?> recibirOrden(@PathVariable Integer id) {
        return ordenRepo.findById(id).map(orden -> {
            
            if (!orden.getEstado().equals("ENVIADA")) {
                return ResponseEntity.badRequest().body("La orden no está en tránsito.");
            }

            // 1. Cerramos la orden
            orden.setEstado("COMPLETADA");
            orden.setFechaRecepcion(LocalDateTime.now());

            // 2. Procesamos cada artículo y lo inyectamos al inventario
            for (DetalleOrdenCompra detalle : orden.getDetalles()) {
                
                detalle.setCantidadRecibida(detalle.getCantidadSolicitada());

                // ¡NACE UN NUEVO LOTE AUTOMÁTICAMENTE!
                LoteAlmacen nuevoLote = new LoteAlmacen();
                nuevoLote.setProducto(detalle.getProducto());
                nuevoLote.setProveedor(orden.getProveedor());
                nuevoLote.setCantidadInicial(detalle.getCantidadRecibida());
                nuevoLote.setCantidadDisponible(detalle.getCantidadRecibida());
                nuevoLote.setPrecioCompra(detalle.getPrecioUnitarioEsperado());
                
                loteRepo.save(nuevoLote);

                // 3. Actualizamos el Stock Global del catálogo
                Producto p = detalle.getProducto();
                p.setStockTotal(p.getStockTotal().add(detalle.getCantidadRecibida()));
                productoRepo.save(p);
            }

            ordenRepo.save(orden);
            
            Map<String, String> response = new HashMap<>();
            response.put("mensaje", "Orden recibida e inventario actualizado con éxito.");
            return ResponseEntity.ok(response);
            
        }).orElse(ResponseEntity.notFound().build());
    }

    // EL MOTOR DE CREACIÓN (CARRITO DE COMPRAS)
    @PostMapping("/crear")
    @Transactional
    public ResponseEntity<?> crearOrdenNueva(@RequestBody OrdenNuevaDTO request) {
        // 1. Buscamos al proveedor en la base de datos
        Proveedor prov = proveedorRepo.findById(request.getIdProveedor()).orElseThrow();
        
        OrdenCompra nuevaOrden = new OrdenCompra();
        nuevaOrden.setProveedor(prov);
        nuevaOrden.setEstado("ENVIADA"); 
        
        List<DetalleOrdenCompra> listaDetalles = new ArrayList<>();
        BigDecimal granTotal = BigDecimal.ZERO;

        // 2. Procesamos cada producto del "carrito"
        for (DetalleNuevoDTO dto : request.getDetalles()) {
            Producto prod = productoRepo.findById(dto.getIdProducto()).orElseThrow();
            
            DetalleOrdenCompra det = new DetalleOrdenCompra();
            det.setOrdenCompra(nuevaOrden);
            det.setProducto(prod);
            det.setCantidadSolicitada(dto.getCantidad());
            det.setPrecioUnitarioEsperado(dto.getPrecioUnitario());
            
            BigDecimal subtotal = dto.getCantidad().multiply(dto.getPrecioUnitario());
            det.setSubtotal(subtotal);
            granTotal = granTotal.add(subtotal);
            
            listaDetalles.add(det);
        }

        // 3. Ensamblamos y guardamos todo en cascada
        nuevaOrden.setDetalles(listaDetalles);
        nuevaOrden.setTotalEstimado(granTotal);
        ordenRepo.save(nuevaOrden);

        return ResponseEntity.ok().body("{\"mensaje\": \"Orden generada exitosamente\"}");
    }
}