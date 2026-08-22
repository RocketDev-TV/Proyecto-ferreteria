package com.ferreteria.ferreteria_backend.repositories;

import com.ferreteria.ferreteria_backend.entities.OrdenCompra;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrdenCompraRepository extends JpaRepository<OrdenCompra, Integer> {
    // Para traernos solo las órdenes que vienen en camino
    List<OrdenCompra> findByEstado(String estado);
}