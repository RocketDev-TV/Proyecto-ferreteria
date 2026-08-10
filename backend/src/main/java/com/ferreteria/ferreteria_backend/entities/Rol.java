package com.ferreteria.ferreteria_backend.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "Roles")
public class Rol {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_rol")
    private Integer idRol;

    @Column(name = "tipo_rol", nullable = false, length = 50)
    private String tipoRol;

    @Column(name = "descripcion", length = 150)
    private String descripcion;

    public Rol() {}

    // Getters y Setters
    public Integer getIdRol() { return idRol; }
    public void setIdRol(Integer idRol) { this.idRol = idRol; }
    public String getTipoRol() { return tipoRol; }
    public void setTipoRol(String tipoRol) { this.tipoRol = tipoRol; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
}