package com.ferreteria.ferreteria_backend.repositories;
import com.ferreteria.ferreteria_backend.entities.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
    // Spring Boot hace la consulta SQL, solo con leer el nombre del método
    Optional<Usuario> findByNombreUsuario(String nombreUsuario); 
}