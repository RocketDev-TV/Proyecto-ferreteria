package com.ferreteria.ferreteria_backend.repositories;

import com.ferreteria.ferreteria_backend.entities.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Integer> {
}