package com.ferreteria.ferreteria_backend.repositories;
import com.ferreteria.ferreteria_backend.entities.LoteAlmacen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LoteAlmacenRepository extends JpaRepository<LoteAlmacen, Integer> {}