import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const swalApp = Swal.mixin({
  background: '#2A2A2A',
  color: '#DEDEDE',
  confirmButtonColor: '#F25623',
  cancelButtonColor: '#4D4D4D',
  customClass: { popup: 'swal-custom-border' }
});

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  // ¡NOMBRES ALINEADOS AL UsuarioDTO DE SPRING BOOT!
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    nombreUsuario: '', 
    contrasena: '',
    idRol: 2 // Asumiendo que 2 es Cajero en tu BD
  });

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/usuarios', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setUsuarios(await response.json());
      }
    } catch (err) {
      console.error('Error al cargar usuarios', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openAddModal = () => {
    setEditingUser(null);
    setFormData({ nombreCompleto: '', nombreUsuario: '', contrasena: '', idRol: 2 });
    setIsModalOpen(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({ 
      nombreCompleto: user.nombreCompleto, 
      nombreUsuario: user.nombreUsuario, // Mapeo correcto
      contrasena: '', 
      idRol: user.rol?.idRol || 2 // Extraemos el ID numérico
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id, nombre) => {
    if (id === 1) {
      swalApp.fire('Acción Denegada', 'El administrador principal no puede ser eliminado por seguridad.', 'error');
      return;
    }

    const result = await swalApp.fire({
      title: `¿Dar de baja a ${nombre}?`,
      text: "Se le revocará el acceso al sistema inmediatamente.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, dar de baja',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8080/api/usuarios/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          swalApp.fire('Baja Exitosa', 'El usuario ha sido eliminado.', 'success');
          fetchUsuarios();
        } else {
          swalApp.fire('Error', 'No se pudo eliminar el usuario.', 'error');
        }
      } catch (err) {
        swalApp.fire('Error de Red', 'Problema al conectar con el servidor.', 'error');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Armamos el payload garantizando que idRol sea un número entero
    const payload = { 
      ...formData,
      idRol: parseInt(formData.idRol) 
    };
    
    if (editingUser && !payload.contrasena) {
      delete payload.contrasena;
    }

    try {
      const token = localStorage.getItem('token');
      const url = editingUser 
        ? `http://localhost:8080/api/usuarios/${editingUser.idUsuario}` 
        : 'http://localhost:8080/api/usuarios';
      
      const response = await fetch(url, {
        method: editingUser ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setIsModalOpen(false);
        swalApp.fire('Éxito', `Usuario ${editingUser ? 'actualizado' : 'registrado'} correctamente`, 'success');
        fetchUsuarios();
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
          <h1 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.5rem', fontWeight: '600' }}>Control de Accesos</h1>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Gestión de personal y roles del sistema</p>
        </div>
        <button onClick={openAddModal} style={{ padding: '10px 16px', backgroundColor: 'var(--accent)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '500', cursor: 'pointer' }}>
          + Nuevo Usuario
        </button>
      </div>

      <div style={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando personal...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'rgba(0,0,0,0.2)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.85rem', textTransform: 'uppercase' }}>ID</th>
                <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.85rem', textTransform: 'uppercase' }}>Nombre Completo</th>
                <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.85rem', textTransform: 'uppercase' }}>Credenciales</th>
                <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.85rem', textTransform: 'uppercase', textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(user => (
                <tr key={user.idUsuario} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>#{user.idUsuario}</td>
                  <td style={{ padding: '16px', color: 'var(--text-main)', fontWeight: '500' }}>{user.nombreCompleto}</td>
                  <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    {/* Imprimimos nombreUsuario en vez de username */}
                    <span style={{ color: 'var(--text-main)' }}>@{user.nombreUsuario}</span> <br/>
                    <span style={{ 
                      display: 'inline-block', marginTop: '4px', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold',
                      backgroundColor: user.rol?.tipoRol === 'ADMIN' ? 'rgba(71, 191, 255, 0.1)' : 'rgba(62, 207, 142, 0.1)',
                      color: user.rol?.tipoRol === 'ADMIN' ? '#47bfff' : '#3ECF8E'
                    }}>
                      {user.rol?.tipoRol || 'SIN ROL'}
                    </span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                      <button onClick={() => handleEdit(user)} title="Editar Acceso" style={{ background: 'none', border: 'none', color: '#47bfff', cursor: 'pointer', padding: '4px' }}>
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button onClick={() => handleDelete(user.idUsuario, user.nombreCompleto)} title="Dar de baja" style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', padding: '4px' }}>
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {usuarios.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>No hay usuarios registrados.</td>
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
              {editingUser ? 'Actualizar Credenciales' : 'Registrar Personal'}
            </h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div>
                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '8px', fontWeight: '600' }}>Nombre Completo</label>
                <input type="text" name="nombreCompleto" value={formData.nombreCompleto} onChange={handleInputChange} required placeholder="Ej. Juan Pérez" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none' }} />
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '8px', fontWeight: '600' }}>Usuario (Login)</label>
                <input type="text" name="nombreUsuario" value={formData.nombreUsuario} onChange={handleInputChange} required placeholder="ej. juanp" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none' }} />
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '8px', fontWeight: '600' }}>
                  Contraseña {editingUser && <span style={{ color: 'var(--accent)', fontSize: '0.75rem', fontWeight: 'normal' }}>(Dejar en blanco para mantener actual)</span>}
                </label>
                <input type="password" name="contrasena" value={formData.contrasena} onChange={handleInputChange} required={!editingUser} placeholder="••••••••" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none' }} />
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '8px', fontWeight: '600' }}>Nivel de Acceso</label>
                <select name="idRol" value={formData.idRol} onChange={handleInputChange} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none' }}>
                  {/* Aquí asumo que 2 es Cajero y 1 es Admin, si es al revés en tu BD, solo invierte los números */}
                  <option value={2}>Cajero (Solo Punto de Venta)</option>
                  <option value={1}>Administrador (Acceso Total)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '12px', backgroundColor: 'transparent', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" disabled={isSubmitting} style={{ flex: 1, padding: '12px', backgroundColor: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}>
                  {editingUser ? 'Actualizar' : 'Otorgar Acceso'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}