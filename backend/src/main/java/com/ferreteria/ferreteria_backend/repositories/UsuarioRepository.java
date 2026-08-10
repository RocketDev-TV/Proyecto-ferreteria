package com.ferreteria.ferreteria_backend.repositories;
import com.ferreteria.ferreteria_backend.entities.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {}