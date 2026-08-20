import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const swalApp = Swal.mixin({
  background: '#2A2A2A',
  color: '#DEDEDE',
  confirmButtonColor: '#F25623',
  cancelButtonColor: '#4D4D4D',
  customClass: { popup: 'swal-custom-border' }
});

export default function Proveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProv, setEditingProv] = useState(null);
  
  const [formData, setFormData] = useState({
    nombre: '',
    numero: '',
    correo: ''
  });

  useEffect(() => {
    fetchProveedores();
  }, []);

  const fetchProveedores = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/proveedores', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setProveedores(await response.json());
      }
    } catch (err) {
      console.error('Error al cargar proveedores', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Abrir modal para CREAR
  const openAddModal = () => {
    setEditingProv(null);
    setFormData({ nombre: '', numero: '', correo: '' });
    setIsModalOpen(true);
  };

  // Abrir modal para EDITAR
  const handleEdit = (prov) => {
    setEditingProv(prov);
    setFormData({ 
      nombre: prov.nombre, 
      numero: prov.numero, 
      correo: prov.correo || '' 
    });
    setIsModalOpen(true);
  };

  // Función para ELIMINAR
  const handleDelete = async (id, nombre) => {
    const result = await swalApp.fire({
      title: `¿Eliminar a ${nombre}?`,
      text: "Esta acción no se puede deshacer.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8080/api/proveedores/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          swalApp.fire('Eliminado', 'El proveedor fue borrado del sistema.', 'success');
          fetchProveedores(); // Refrescar tabla
        } else {
          swalApp.fire('Error', 'No se pudo eliminar. Es posible que existan lotes asociados a este proveedor.', 'error');
        }
      } catch (err) {
        swalApp.fire('Error de Red', 'Problema al conectar con el servidor.', 'error');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      const url = editingProv 
        ? `http://localhost:8080/api/proveedores/${editingProv.idProveedor}` 
        : 'http://localhost:8080/api/proveedores';
      
      const response = await fetch(url, {
        method: editingProv ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setIsModalOpen(false);
        swalApp.fire('Éxito', `Proveedor ${editingProv ? 'actualizado' : 'guardado'} correctamente`, 'success');
        fetchProveedores();
      } else {
        const errData = await response.json().catch(() => ({}));
        swalApp.fire('Error', 'Verifique los datos ingresados. ' + JSON.stringify(errData), 'error');
      }
    } catch (err) {
      swalApp.fire('Error de Red', 'Problema al conectar con el servidor.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.5rem', fontWeight: '600' }}>Directorio de Proveedores</h1>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Gestión de contactos y suministros</p>
        </div>
        <button onClick={openAddModal} style={{ padding: '10px 16px', backgroundColor: 'var(--accent)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '500', cursor: 'pointer' }}>
          + Nuevo Proveedor
        </button>
      </div>

      <div style={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando directorio...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'rgba(0,0,0,0.2)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.85rem', textTransform: 'uppercase' }}>ID</th>
                <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.85rem', textTransform: 'uppercase' }}>Razón Social / Nombre</th>
                <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.85rem', textTransform: 'uppercase' }}>Contacto</th>
                <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.85rem', textTransform: 'uppercase', textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {proveedores.map(prov => (
                <tr key={prov.idProveedor} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>#{prov.idProveedor}</td>
                  <td style={{ padding: '16px', color: 'var(--text-main)', fontWeight: '500' }}>{prov.nombre}</td>
                  <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Tel: {prov.numero || 'N/A'} <br/>
                    Email: {prov.correo || 'N/A'}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                      <button 
                        onClick={() => handleEdit(prov)} 
                        title="Editar"
                        style={{ background: 'none', border: 'none', color: '#47bfff', cursor: 'pointer', padding: '4px' }}
                      >
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button 
                        onClick={() => handleDelete(prov.idProveedor, prov.nombre)} 
                        title="Eliminar"
                        style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', padding: '4px' }}
                      >
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {proveedores.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No hay proveedores registrados en el sistema.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'var(--bg-panel)', padding: '32px', borderRadius: '12px', border: '1px solid var(--border-color)', width: '100%', maxWidth: '400px' }}>
            <h2 style={{ margin: '0 0 24px 0', color: 'var(--text-main)' }}>
              {editingProv ? 'Editar Proveedor' : 'Registrar Proveedor'}
            </h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} required placeholder="Nombre o Razón Social" style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none' }} />
              <input type="text" name="numero" value={formData.numero} onChange={handleInputChange} required placeholder="Número telefónico" style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none' }} />
              <input type="email" name="correo" value={formData.correo} onChange={handleInputChange} placeholder="Correo electrónico" style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none' }} />
              
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '12px', backgroundColor: 'transparent', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" disabled={isSubmitting} style={{ flex: 1, padding: '12px', backgroundColor: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}>
                  {editingProv ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}