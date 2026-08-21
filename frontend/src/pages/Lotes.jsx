import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const swalApp = Swal.mixin({
  background: '#2A2A2A',
  color: '#DEDEDE',
  confirmButtonColor: '#F25623',
  cancelButtonColor: '#4D4D4D',
  customClass: { popup: 'swal-custom-border' }
});

export default function Lotes() {
  const [productos, setProductos] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    idProducto: '',
    idProveedor: '',
    cantidadInicial: '',
    precioCompra: ''
  });

  useEffect(() => {
    cargarDatosLocales();
  }, []);

  const cargarDatosLocales = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [prodRes, lotesRes, provRes] = await Promise.all([
        fetch('http://localhost:8080/api/productos?page=0&size=100', { headers }),
        fetch('http://localhost:8080/api/lotes', { headers }),
        fetch('http://localhost:8080/api/proveedores', { headers })
      ]);

      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProductos(prodData.content || prodData);
      }
      if (lotesRes.ok) {
        const lotesData = await lotesRes.json();
        setLotes(lotesData.sort((a, b) => b.idLote - a.idLote));
      }
      if (provRes.ok) {
        setProveedores(await provRes.json());
      }
    } catch (err) {
      console.error('Error al cargar datos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // --- VALIDACIÓN FINANCIERA ESTRATÉGICA ---
    const prodSeleccionado = productos.find(p => p.idProducto === parseInt(formData.idProducto));
    if (prodSeleccionado && parseFloat(formData.precioCompra) >= prodSeleccionado.precioVentaAct) {
      swalApp.fire({
        icon: 'error',
        title: 'Alerta de Pérdida Financiera',
        text: `El costo de compra ($${formData.precioCompra}) no puede ser mayor o igual al precio de venta actual ($${prodSeleccionado.precioVentaAct}). Actualice el precio de venta en el catálogo primero.`
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const payload = {
        idProducto: parseInt(formData.idProducto),
        idProveedor: parseInt(formData.idProveedor),
        cantidadInicial: parseFloat(formData.cantidadInicial),
        cantidadDisponible: parseFloat(formData.cantidadInicial),
        precioCompra: parseFloat(formData.precioCompra)
      };

      const response = await fetch('http://localhost:8080/api/lotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        swalApp.fire('Ingreso Registrado', 'El lote se sumó al inventario.', 'success');
        setFormData({ idProducto: '', idProveedor: '', cantidadInicial: '', precioCompra: '' });
        cargarDatosLocales();
      } else {
        const errorData = await response.json();
        swalApp.fire('Error', 'Verifique los datos. ' + JSON.stringify(errorData), 'error');
      }
    } catch (err) {
      swalApp.fire('Error de Red', 'Problema al conectar con el servidor.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatearFecha = (lote) => {
    const fechaReal = lote.fechaRegistro; 
    
    if (!fechaReal) return 'N/A';

    if (Array.isArray(fechaReal)) {
      return new Date(fechaReal[0], fechaReal[1] - 1, fechaReal[2]).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
    }

    return new Date(fechaReal).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.5rem', fontWeight: '600' }}>Recepción de Mercancía</h1>
        <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Registro de entrada de lotes y costeo PEPS</p>
      </div>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        <div style={{ flex: '1', backgroundColor: 'var(--bg-panel)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)', position: 'sticky', top: '24px' }}>
          <h2 style={{ margin: '0 0 20px 0', color: 'var(--text-main)', fontSize: '1.1rem' }}>Registrar Nuevo Lote</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div>
              <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '8px', fontWeight: '600' }}>Proveedor</label>
              <select name="idProveedor" value={formData.idProveedor} onChange={handleInputChange} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none' }}>
                <option value="">Seleccione el proveedor...</option>
                {proveedores.map(prov => (
                  <option key={prov.idProveedor} value={prov.idProveedor}>{prov.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '8px', fontWeight: '600' }}>Producto</label>
              <select name="idProducto" value={formData.idProducto} onChange={handleInputChange} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none' }}>
                <option value="">Seleccione el artículo...</option>
                {productos.map(prod => (
                  <option key={prod.idProducto} value={prod.idProducto}>
                    #{prod.idProducto.toString().padStart(4, '0')} - {prod.nombre} (Venta: ${prod.precioVentaAct})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '8px', fontWeight: '600' }}>Cantidad</label>
                <input type="number" step="0.01" min="0.01" name="cantidadInicial" value={formData.cantidadInicial} onChange={handleInputChange} required placeholder="0" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '8px', fontWeight: '600' }}>Precio Compra</label>
                <input type="number" step="0.01" min="0.01" name="precioCompra" value={formData.precioCompra} onChange={handleInputChange} required placeholder="$0.00" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none' }} />
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} style={{ marginTop: '8px', padding: '14px', backgroundColor: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}>
              {isSubmitting ? 'Procesando...' : 'Confirmar Ingreso a Almacén'}
            </button>
          </form>
        </div>

        <div style={{ flex: '2', backgroundColor: 'var(--bg-panel)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.1)' }}>
            <h2 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.1rem' }}>Últimas Entradas Registradas</h2>
          </div>
          
          {loading ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando bitácora de almacén...</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: 'rgba(0,0,0,0.2)', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.85rem', textTransform: 'uppercase' }}>Lote / Fecha</th>
                    <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.85rem', textTransform: 'uppercase' }}>Producto & Proveedor</th>
                    <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.85rem', textTransform: 'uppercase', textAlign: 'right' }}>Costo</th>
                    <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.85rem', textTransform: 'uppercase', textAlign: 'center' }}>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {lotes.map((lote) => {
                    const agotado = lote.cantidadDisponible <= 0;
                    return (
                      <tr key={lote.idLote} style={{ borderBottom: '1px solid var(--border-color)', opacity: agotado ? 0.6 : 1 }}>
                        <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                          <strong style={{ color: 'var(--text-main)', display: 'block' }}>Lote #{lote.idLote}</strong>
                          {/* Y aquí simplemente le mandamos el lote completo a la función */}
                          {formatearFecha(lote)}
                        </td>
                        <td style={{ padding: '16px', color: 'var(--text-main)', fontWeight: '500' }}>
                          {lote.producto?.nombre} <br/>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{lote.proveedor?.nombre}</span>
                        </td>
                        <td style={{ padding: '16px', color: 'var(--text-main)', textAlign: 'right' }}>
                          ${lote.precioCompra.toFixed(2)}
                        </td>
                        <td style={{ padding: '16px', textAlign: 'center' }}>
                          {agotado ? (
                            <span style={{ fontSize: '0.8rem', backgroundColor: 'rgba(255, 68, 68, 0.1)', color: '#ff4444', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>Agotado</span>
                          ) : (
                            <span style={{ fontSize: '0.8rem', backgroundColor: 'rgba(62, 207, 142, 0.1)', color: '#3ECF8E', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                              {lote.cantidadDisponible} / {lote.cantidadInicial}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}