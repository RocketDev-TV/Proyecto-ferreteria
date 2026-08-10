package com.ferreteria.ferreteria_backend.repositories;
import com.ferreteria.ferreteria_backend.entities.Proveedor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProveedorRepository extends JpaRepository<Proveedor, Integer> {}