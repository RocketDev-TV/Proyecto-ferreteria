package com.ferreteria.ferreteria_backend.dtos;
import java.util.List;

public class OrdenNuevaDTO {
    
    private Integer idProveedor;
    private List<DetalleNuevoDTO> detalles;

    public OrdenNuevaDTO() {
    }

    // --- Getters y Setters ---
    public Integer getIdProveedor() {
        return idProveedor;
    }

    public void setIdProveedor(Integer idProveedor) {
        this.idProveedor = idProveedor;
    }

    public List<DetalleNuevoDTO> getDetalles() {
        return detalles;
    }

    public void setDetalles(List<DetalleNuevoDTO> detalles) {
        this.detalles = detalles;
    }
}