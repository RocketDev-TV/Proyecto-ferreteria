package com.ferreteria.ferreteria_backend.repositories;
import com.ferreteria.ferreteria_backend.entities.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Integer> {}