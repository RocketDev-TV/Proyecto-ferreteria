import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

// Configuramos el estilo corporativo oscuro para todas las alertas
const swalApp = Swal.mixin({
  background: '#2A2A2A',
  color: '#DEDEDE',
  confirmButtonColor: '#F25623',
  cancelButtonColor: '#4D4D4D',
  customClass: {
    popup: 'swal-custom-border'
  }
});

export default function Inventario() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Filtros y Búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('');

  // Ordenamiento de Columnas (Sorting)
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Estados para el Modal de Agregar/Editar
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    idCategoria: '',
    nombre: '',
    descripcion: '',
    precioVentaAct: '',
    stockTotal: ''
  });

  useEffect(() => {
    fetchProductos(page);
    fetchCategorias();
  }, [page]);

  const fetchProductos = async (paginaActual) => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/productos?page=${paginaActual}&size=10`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setProductos(data.content);
        setTotalPages(data.totalPages);
      } else {
        setError('Acceso denegado o sesión expirada. Por favor, inicie sesión nuevamente.');
      }
    } catch (err) {
      setError('Error de conexión. Verifique que el servidor backend esté en ejecución.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategorias = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/categorias', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCategorias(data);
      }
    } catch (err) {
      console.error('Error al cargar categorías');
    }
  };

  // --- LÓGICA DE ORDENAMIENTO ---
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // --- LÓGICA DE AGREGAR / EDITAR ---
  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({ idCategoria: '', nombre: '', descripcion: '', precioVentaAct: '', stockTotal: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (producto) => {
    setEditingProduct(producto);
    setFormData({
      idCategoria: producto.categoria.idCategoria,
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      precioVentaAct: producto.precioVentaAct,
      stockTotal: producto.stockTotal
    });
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      const payload = {
        idCategoria: parseInt(formData.idCategoria),
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        precioVentaAct: parseFloat(formData.precioVentaAct),
        stockTotal: parseFloat(formData.stockTotal)
      };

      const url = editingProduct 
        ? `http://localhost:8080/api/productos/${editingProduct.idProducto}` 
        : 'http://localhost:8080/api/productos';
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setIsModalOpen(false);
        swalApp.fire({
          icon: 'success',
          title: 'Operación Exitosa',
          text: editingProduct ? 'El producto ha sido actualizado.' : 'El producto ha sido registrado correctamente.',
          timer: 2000,
          showConfirmButton: false
        });
        fetchProductos(page);
      } else {
        const errorData = await response.json();
        swalApp.fire({
          icon: 'error',
          title: 'Error de Validación',
          text: 'Revise los datos ingresados. ' + JSON.stringify(errorData)
        });
      }
    } catch (err) {
      swalApp.fire({
        icon: 'error',
        title: 'Error de Red',
        text: 'Ocurrió un error al procesar la solicitud con el servidor.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- LÓGICA DE ELIMINACIÓN CON SWEETALERT ---
  const handleDeleteRequest = (producto) => {
    if (producto.stockTotal > 0) {
      swalApp.fire({
        icon: 'warning',
        title: 'Violación de Regla de Negocio',
        text: 'No es posible eliminar un producto que cuenta con existencias en almacén. Realice un ajuste de inventario a 0 antes de proceder.',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    swalApp.fire({
      title: 'Acción Irreversible',
      text: `Está a punto de eliminar permanentemente el producto "${producto.nombre}". ¿Desea proceder?`,
      icon: 'error',
      showCancelButton: true,
      confirmButtonText: 'Confirmar Eliminación',
      cancelButtonText: 'Abortar',
      confirmButtonColor: '#ff4444'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`http://localhost:8080/api/productos/${producto.idProducto}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (response.ok) {
            swalApp.fire('Eliminado', 'El registro fue borrado exitosamente.', 'success');
            fetchProductos(page);
          } else {
            swalApp.fire('Error', 'Ocurrió un problema al intentar eliminar el registro.', 'error');
          }
        } catch (err) {
          swalApp.fire('Error de Red', 'No se pudo conectar con el servidor.', 'error');
        }
      }
    });
  };

  // --- APLICACIÓN DE FILTROS Y ORDENAMIENTO EN FRONTAL ---
  let productosFiltrados = productos.filter(p => {
    const matchSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        p.idProducto.toString().includes(searchTerm);
    const matchCategory = filterCategoria === '' || p.categoria.idCategoria.toString() === filterCategoria;
    return matchSearch && matchCategory;
  });

  if (sortConfig.key !== null) {
    productosFiltrados.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Helper visual para mostrar el SVG de ordenamiento
  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '6px', verticalAlign: 'text-bottom' }} viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"></polyline></svg>
    ) : (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '6px', verticalAlign: 'text-bottom' }} viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"></polyline></svg>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
      
      {/* Cabecera del Módulo */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.5rem', fontWeight: '600' }}>Catálogo de Inventario</h1>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Gestión, edición y control de existencias en almacén</p>
        </div>
        <button 
          onClick={openAddModal}
          style={{ padding: '10px 16px', backgroundColor: 'var(--accent)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '500', cursor: 'pointer', transition: 'background-color 0.2s' }}
        >
          + Registrar Producto
        </button>
      </div>

      {/* Contenedor Principal (Panel) */}
      <div style={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden' }}>
        
        {/* Barra de Filtros */}
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '16px', backgroundColor: 'rgba(0,0,0,0.1)' }}>
          <input 
            type="text" 
            placeholder="Buscar por SKU o Nombre..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1, padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none' }}
          />
          <select 
            value={filterCategoria} 
            onChange={(e) => setFilterCategoria(e.target.value)}
            style={{ width: '250px', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none' }}
          >
            <option value="">Todas las clasificaciones</option>
            {categorias.map(cat => (
              <option key={cat.idCategoria} value={cat.idCategoria}>{cat.nombre}</option>
            ))}
          </select>
        </div>

        {error && <div style={{ padding: '16px', backgroundColor: 'rgba(255, 68, 68, 0.1)', color: '#ff4444', borderBottom: '1px solid var(--border-color)' }}>{error}</div>}
        {loading && <div style={{ padding: '16px', color: 'var(--text-muted)' }}>Sincronizando información con el servidor...</div>}

        {/* Tabla de Datos */}
        {!loading && !error && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'rgba(0,0,0,0.2)', borderBottom: '1px solid var(--border-color)' }}>
                  <th onClick={() => requestSort('idProducto')} style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.85rem', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none' }}>
                    SKU {getSortIndicator('idProducto')}
                  </th>
                  <th onClick={() => requestSort('nombre')} style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.85rem', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none' }}>
                    Producto {getSortIndicator('nombre')}
                  </th>
                  <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                    Categoría
                  </th>
                  <th onClick={() => requestSort('precioVentaAct')} style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.85rem', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none' }}>
                    Precio Venta {getSortIndicator('precioVentaAct')}
                  </th>
                  <th onClick={() => requestSort('stockTotal')} style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.85rem', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none' }}>
                    Stock {getSortIndicator('stockTotal')}
                  </th>
                  <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.85rem', textTransform: 'uppercase', textAlign: 'center' }}>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {productosFiltrados.map((producto) => (
                  <tr key={producto.idProducto} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      #{producto.idProducto.toString().padStart(4, '0')}
                    </td>
                    <td style={{ padding: '16px', color: 'var(--text-main)', fontWeight: '500' }}>
                      {producto.nombre}
                    </td>
                    <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      {producto.categoria.nombre}
                    </td>
                    <td style={{ padding: '16px', color: 'var(--text-main)' }}>
                      ${producto.precioVentaAct.toFixed(2)}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ 
                        padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: '600',
                        backgroundColor: producto.stockTotal > 10 ? 'rgba(62, 207, 142, 0.1)' : 'rgba(242, 86, 35, 0.1)',
                        color: producto.stockTotal > 10 ? '#3ECF8E' : 'var(--accent)'
                      }}>
                        {producto.stockTotal} und
                      </span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button onClick={() => openEditModal(producto)} style={{ background: 'none', border: 'none', color: '#47bfff', cursor: 'pointer' }} title="Modificar Producto">
                          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button onClick={() => handleDeleteRequest(producto)} style={{ background: 'none', border: 'none', color: producto.stockTotal > 0 ? 'var(--border-color)' : '#ff4444', cursor: producto.stockTotal > 0 ? 'not-allowed' : 'pointer' }} title="Eliminar del Sistema">
                          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {productosFiltrados.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No se encontraron registros que coincidan con los criterios de búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Página {page + 1} de {totalPages || 1}
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setPage(page - 1)} disabled={page === 0} style={{ padding: '8px 16px', backgroundColor: 'var(--bg-panel)', color: page === 0 ? 'var(--text-muted)' : 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: page === 0 ? 'not-allowed' : 'pointer' }}>Anterior</button>
            <button onClick={() => setPage(page + 1)} disabled={page >= totalPages - 1} style={{ padding: '8px 16px', backgroundColor: 'var(--bg-panel)', color: page >= totalPages - 1 ? 'var(--text-muted)' : 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer' }}>Siguiente</button>
          </div>
        </div>
      </div>

      {/* MODAL DE AGREGAR / EDITAR PRODUCTO */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: 'var(--bg-panel)', padding: '32px', borderRadius: '12px', border: '1px solid var(--border-color)', width: '100%', maxWidth: '500px', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
            <h2 style={{ margin: '0 0 24px 0', color: 'var(--text-main)', fontSize: '1.25rem' }}>
              {editingProduct ? 'Modificación de Producto' : 'Registro de Nuevo Producto'}
            </h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '8px' }}>Categoría del Producto</label>
                <select name="idCategoria" value={formData.idCategoria} onChange={handleInputChange} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none' }}>
                  <option value="">Seleccione una clasificación...</option>
                  {categorias.map(cat => (
                    <option key={cat.idCategoria} value={cat.idCategoria}>{cat.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '8px' }}>Nombre o Título</label>
                <input type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} required placeholder="Nombre del artículo" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none' }} />
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '8px' }}>Descripción Técnica</label>
                <input type="text" name="descripcion" value={formData.descripcion} onChange={handleInputChange} placeholder="Especificaciones adicionales..." style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none' }} />
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '8px' }}>Precio de Venta ($)</label>
                  <input type="number" step="0.01" min="0.01" name="precioVentaAct" value={formData.precioVentaAct} onChange={handleInputChange} required placeholder="0.00" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '8px' }}>Stock Físico</label>
                  <input type="number" step="0.01" min="0" name="stockTotal" value={formData.stockTotal} onChange={handleInputChange} required placeholder="0" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '12px', backgroundColor: 'transparent', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}>
                  Cancelar Operación
                </button>
                <button type="submit" disabled={isSubmitting} style={{ flex: 1, padding: '12px', backgroundColor: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', cursor: isSubmitting ? 'not-allowed' : 'pointer', fontWeight: '500' }}>
                  {isSubmitting ? 'Procesando...' : (editingProduct ? 'Guardar Cambios' : 'Registrar Producto')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}