import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  const [ordenesPendientes, setOrdenesPendientes] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [activeTab, setActiveTab] = useState('manual');

  const [formData, setFormData] = useState({
    idProducto: '', idProveedor: '', cantidadInicial: '', precioCompra: ''
  });

  const [proveedorOrden, setProveedorOrden] = useState('');
  const [detallesOrden, setDetallesOrden] = useState([]);
  const [prodSeleccionadoOrden, setProdSeleccionadoOrden] = useState('');
  const [cantidadOrden, setCantidadOrden] = useState('');
  const [precioOrden, setPrecioOrden] = useState('');

  useEffect(() => {
    cargarDatosLocales();
  }, []);

  const cargarDatosLocales = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [prodRes, lotesRes, provRes, ordRes] = await Promise.all([
        fetch('http://localhost:8080/api/productos?page=0&size=100', { headers }),
        fetch('http://localhost:8080/api/lotes', { headers }),
        fetch('http://localhost:8080/api/proveedores', { headers }),
        fetch('http://localhost:8080/api/ordenes/pendientes', { headers })
      ]);

      if (prodRes.ok) setProductos((await prodRes.json()).content || await prodRes.json());
      if (lotesRes.ok) setLotes((await lotesRes.json()).sort((a, b) => b.idLote - a.idLote));
      if (provRes.ok) setProveedores(await provRes.json());
      if (ordRes.ok) setOrdenesPendientes(await ordRes.json());
    } catch (err) {
      console.error('Error al cargar datos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitManual = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const prodSeleccionado = productos.find(p => p.idProducto === parseInt(formData.idProducto));
    if (prodSeleccionado && parseFloat(formData.precioCompra) >= prodSeleccionado.precioVentaAct) {
      swalApp.fire('Alerta de Pérdida', 'El costo de compra no puede ser mayor o igual al precio de venta actual.', 'error');
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
        swalApp.fire('Error', 'Verifique los datos.', 'error');
      }
    } catch (err) {
      swalApp.fire('Error de Red', 'Problema al conectar con el servidor.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecibirOrden = async (orden) => {
    const result = await swalApp.fire({
      title: `¿Recibir Orden #${orden.idOrden}?`,
      text: `Se ingresarán ${orden.detalles.length} partidas de ${orden.proveedor.nombre}.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, Autorizar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8080/api/ordenes/${orden.idOrden}/recibir`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          swalApp.fire('¡Exitosa!', 'Los productos ya están en tu inventario.', 'success');
          cargarDatosLocales();
        } else {
          swalApp.fire('Error', 'No se pudo procesar la orden.', 'error');
        }
      } catch (error) {
        swalApp.fire('Error de Conexión', 'Problema de red.', 'error');
      }
    }
  };

  const agregarAlCarrito = () => {
    if (!prodSeleccionadoOrden || !cantidadOrden || !precioOrden) return;
    const prodInfo = productos.find(p => p.idProducto === parseInt(prodSeleccionadoOrden));
    
    const nuevo = {
      idProducto: prodInfo.idProducto,
      nombre: prodInfo.nombre,
      cantidad: parseFloat(cantidadOrden),
      precioUnitario: parseFloat(precioOrden),
      subtotal: parseFloat(cantidadOrden) * parseFloat(precioOrden)
    };
    
    setDetallesOrden([...detallesOrden, nuevo]);
    setProdSeleccionadoOrden('');
    setCantidadOrden('');
    setPrecioOrden('');
  };

  const quitarDelCarrito = (index) => {
    const nuevos = [...detallesOrden];
    nuevos.splice(index, 1);
    setDetallesOrden(nuevos);
  };

  const enviarNuevaOrden = async () => {
    if (!proveedorOrden || detallesOrden.length === 0) {
      swalApp.fire('Atención', 'Selecciona un proveedor y agrega al menos un artículo.', 'warning');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        idProveedor: parseInt(proveedorOrden),
        detalles: detallesOrden.map(d => ({
          idProducto: d.idProducto,
          cantidad: d.cantidad,
          precioUnitario: d.precioUnitario
        }))
      };

      const response = await fetch('http://localhost:8080/api/ordenes/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        swalApp.fire('¡Orden Enviada!', 'El pedido ha sido generado y está en tránsito.', 'success');
        setProveedorOrden('');
        setDetallesOrden([]);
        cargarDatosLocales();
        setActiveTab('ordenes'); 
      } else {
        swalApp.fire('Error', 'No se pudo generar la orden.', 'error');
      }
    } catch (error) {
      swalApp.fire('Error de Conexión', 'Falla al contactar al servidor.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- LÓGICA CORREGIDA PARA EL PDF ---
  const descargarPDF = (orden) => {
    const doc = new jsPDF();
    
    // Configuración de la Cabecera
    doc.setFontSize(22);
    doc.setTextColor(242, 86, 35); 
    doc.text("PRO-FERRETERIA", 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`FOLIO DE ORDEN: #${orden.idOrden.toString().padStart(5, '0')}`, 14, 32);
    doc.text(`FECHA DE EMISIÓN: ${formatearFecha(orden.fechaCreacion)}`, 14, 38);
    doc.text(`PROVEEDOR: ${orden.proveedor?.nombre?.toUpperCase()}`, 14, 44);
    doc.text(`ESTADO: ${orden.estado}`, 14, 50);

    // Preparar datos para la tabla
    const tableColumn = ["CANTIDAD", "DESCRIPCIÓN DEL PRODUCTO", "PRECIO UNITARIO", "SUBTOTAL"];
    const tableRows = [];

    orden.detalles.forEach(det => {
      const rowData = [
        det.cantidadSolicitada,
        det.producto?.nombre,
        `$${det.precioUnitarioEsperado.toFixed(2)}`,
        `$${det.subtotal.toFixed(2)}`
      ];
      tableRows.push(rowData);
    });

    // NUEVA LLAMADA A AUTOTABLE
    autoTable(doc, {
      startY: 60,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [42, 42, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 4 },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });

    // Agregar el Gran Total al pie de la tabla
    const finalY = doc.lastAutoTable.finalY || 60;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text(`TOTAL ESTIMADO: $${orden.totalEstimado?.toFixed(2)}`, 14, finalY + 12);

    // Descargar el archivo
    doc.save(`Orden_de_Compra_Folio_${orden.idOrden}.pdf`);
  };

  const granTotalOrden = detallesOrden.reduce((acc, curr) => acc + curr.subtotal, 0);

  const formatearFecha = (fechaCruda) => {
    if (!fechaCruda) return 'N/A';
    let fechaReal = fechaCruda;
    if (Array.isArray(fechaReal)) fechaReal = new Date(fechaReal[0], fechaReal[1] - 1, fechaReal[2]);
    return new Date(fechaReal).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.5rem', fontWeight: '600' }}>Recepción de Mercancía</h1>
        <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Gestión de entradas y automatización de Órdenes de Compra</p>
      </div>

      <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <button onClick={() => setActiveTab('crear')} style={{ background: 'none', border: 'none', padding: '8px 16px', color: activeTab === 'crear' ? 'var(--accent)' : 'var(--text-muted)', fontWeight: activeTab === 'crear' ? 'bold' : 'normal', fontSize: '1rem', cursor: 'pointer', borderBottom: activeTab === 'crear' ? '2px solid var(--accent)' : 'none' }}>
          + Generar Pedido
        </button>
        <button onClick={() => setActiveTab('ordenes')} style={{ background: 'none', border: 'none', padding: '8px 16px', color: activeTab === 'ordenes' ? 'var(--accent)' : 'var(--text-muted)', fontWeight: activeTab === 'ordenes' ? 'bold' : 'normal', fontSize: '1rem', cursor: 'pointer', borderBottom: activeTab === 'ordenes' ? '2px solid var(--accent)' : 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
          Órdenes en Tránsito 
          {ordenesPendientes.length > 0 && (
            <span style={{ backgroundColor: '#ff4444', color: 'white', fontSize: '0.75rem', padding: '2px 6px', borderRadius: '10px' }}>{ordenesPendientes.length}</span>
          )}
        </button>
        <button onClick={() => setActiveTab('manual')} style={{ background: 'none', border: 'none', padding: '8px 16px', color: activeTab === 'manual' ? 'var(--accent)' : 'var(--text-muted)', fontWeight: activeTab === 'manual' ? 'bold' : 'normal', fontSize: '1rem', cursor: 'pointer', borderBottom: activeTab === 'manual' ? '2px solid var(--accent)' : 'none' }}>
          Ingreso Manual
        </button>
      </div>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        
        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {activeTab === 'crear' && (
            <div style={{ backgroundColor: 'var(--bg-panel)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <h2 style={{ margin: '0 0 20px 0', color: 'var(--text-main)', fontSize: '1.1rem' }}>Generar Orden de Compra</h2>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '8px', fontWeight: '600' }}>Proveedor a solicitar</label>
                <select value={proveedorOrden} onChange={(e) => setProveedorOrden(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none' }}>
                  <option value="">Seleccione el proveedor...</option>
                  {proveedores.map(prov => <option key={prov.idProveedor} value={prov.idProveedor}>{prov.nombre}</option>)}
                </select>
              </div>

              <div style={{ backgroundColor: 'rgba(0,0,0,0.15)', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: '1px dashed var(--border-color)' }}>
                <label style={{ display: 'block', color: 'var(--text-main)', fontSize: '0.9rem', marginBottom: '12px', fontWeight: '600' }}>Agregar Artículo</label>
                <select value={prodSeleccionadoOrden} onChange={(e) => setProdSeleccionadoOrden(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', marginBottom: '12px' }}>
                  <option value="">Seleccione producto...</option>
                  {productos.map(prod => <option key={prod.idProducto} value={prod.idProducto}>{prod.nombre}</option>)}
                </select>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                  <input type="number" min="0.01" step="0.01" value={cantidadOrden} onChange={(e) => setCantidadOrden(e.target.value)} placeholder="Cantidad pedida" style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }} />
                  <input type="number" min="0.01" step="0.01" value={precioOrden} onChange={(e) => setPrecioOrden(e.target.value)} placeholder="Costo Unitario ($)" style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }} />
                </div>
                <button 
                  type="button" 
                  onClick={agregarAlCarrito} 
                  style={{ width: '100%', padding: '10px', backgroundColor: 'transparent', color: 'var(--accent)', border: '1px solid var(--accent)', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseOver={(e) => { e.target.style.backgroundColor = 'rgba(242, 86, 35, 0.1)'; }}
                  onMouseOut={(e) => { e.target.style.backgroundColor = 'transparent'; }}
                >
                  + Añadir a la lista
                </button>
              </div>

              {detallesOrden.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Artículos a solicitar:</h3>
                  {detallesOrden.map((det, index) => (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-main)', padding: '10px', borderRadius: '8px', marginBottom: '8px' }}>
                      <div style={{ flex: 1, color: 'var(--text-main)', fontSize: '0.85rem' }}>
                        <strong>{det.cantidad}x</strong> {det.nombre} <br/>
                        <span style={{ color: 'var(--text-muted)' }}>${det.precioUnitario.toFixed(2)} c/u (Sub: ${det.subtotal.toFixed(2)})</span>
                      </div>
                      <button onClick={() => quitarDelCarrito(index)} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', fontWeight: 'bold' }}>X</button>
                    </div>
                  ))}
                  <div style={{ textAlign: 'right', marginTop: '12px', color: 'var(--text-main)', fontSize: '1.2rem', fontWeight: 'bold' }}>
                    Total Estimado: ${granTotalOrden.toFixed(2)}
                  </div>
                </div>
              )}

              <button onClick={enviarNuevaOrden} disabled={isSubmitting || detallesOrden.length === 0 || !proveedorOrden} style={{ width: '100%', padding: '14px', backgroundColor: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: (isSubmitting || detallesOrden.length === 0 || !proveedorOrden) ? 'not-allowed' : 'pointer', opacity: (isSubmitting || detallesOrden.length === 0 || !proveedorOrden) ? 0.5 : 1 }}>
                {isSubmitting ? 'Generando...' : 'Confirmar y Enviar Pedido'}
              </button>
            </div>
          )}

          {activeTab === 'ordenes' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {ordenesPendientes.length === 0 ? (
                <div style={{ backgroundColor: 'var(--bg-panel)', padding: '32px', textAlign: 'center', borderRadius: '12px', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  No hay órdenes en tránsito en este momento.
                </div>
              ) : (
                ordenesPendientes.map(orden => (
                  <div key={orden.idOrden} style={{ backgroundColor: 'var(--bg-panel)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', borderLeft: '4px solid #47bfff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <div>
                        <h3 style={{ margin: '0 0 4px 0', color: 'var(--text-main)', fontSize: '1.1rem' }}>Orden #{orden.idOrden} - {orden.proveedor?.nombre}</h3>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Enviada el: {formatearFecha(orden.fechaCreacion)} • <strong>Total: ${orden.totalEstimado?.toFixed(2)}</strong></p>
                      </div>
                      <span style={{ backgroundColor: 'rgba(71, 191, 255, 0.1)', color: '#47bfff', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>EN TRÁNSITO</span>
                    </div>
                    
                    <div style={{ backgroundColor: 'var(--bg-main)', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                      <p style={{ margin: '0 0 8px 0', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Artículos Esperados:</p>
                      {orden.detalles?.map(det => (
                        <div key={det.idDetalleOrden} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '4px' }}>
                          <span>{det.cantidadSolicitada}x {det.producto?.nombre}</span>
                          <span style={{ color: 'var(--text-muted)' }}>${det.precioUnitarioEsperado?.toFixed(2)} c/u</span>
                        </div>
                      ))}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '12px' }}>
                      {/* BOTÓN CON ICONO SVG NATIVO */}
                      <button 
                        onClick={() => descargarPDF(orden)} 
                        style={{ flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', backgroundColor: 'transparent', color: '#DEDEDE', border: '1px solid #4D4D4D', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}
                        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="7 10 12 15 17 10"></polyline>
                          <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        Descargar PDF
                      </button>
                      
                      <button 
                        onClick={() => handleRecibirOrden(orden)} 
                        style={{ flex: '2', padding: '12px', backgroundColor: 'transparent', color: '#47bfff', border: '1px solid #47bfff', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}
                        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(71, 191, 255, 0.1)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                      >
                        Verificar y Dar Entrada
                      </button>
                    </div>

                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'manual' && (
            <div style={{ backgroundColor: 'var(--bg-panel)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <h2 style={{ margin: '0 0 20px 0', color: 'var(--text-main)', fontSize: '1.1rem' }}>Ingreso Manual Rápido</h2>
              <form onSubmit={handleSubmitManual} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <select name="idProveedor" value={formData.idProveedor} onChange={(e) => setFormData({...formData, idProveedor: e.target.value})} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}>
                  <option value="">Seleccione el proveedor...</option>
                  {proveedores.map(prov => <option key={prov.idProveedor} value={prov.idProveedor}>{prov.nombre}</option>)}
                </select>
                <select name="idProducto" value={formData.idProducto} onChange={(e) => setFormData({...formData, idProducto: e.target.value})} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}>
                  <option value="">Seleccione el artículo...</option>
                  {productos.map(prod => <option key={prod.idProducto} value={prod.idProducto}>{prod.nombre}</option>)}
                </select>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <input type="number" min="0.01" step="0.01" value={formData.cantidadInicial} onChange={(e) => setFormData({...formData, cantidadInicial: e.target.value})} required placeholder="Cantidad" style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }} />
                  <input type="number" min="0.01" step="0.01" value={formData.precioCompra} onChange={(e) => setFormData({...formData, precioCompra: e.target.value})} required placeholder="Costo c/u" style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }} />
                </div>
                <button type="submit" disabled={isSubmitting} style={{ padding: '14px', backgroundColor: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}>
                  Confirmar Ingreso Manual
                </button>
              </form>
            </div>
          )}
        </div>

        <div style={{ flex: '1.5', backgroundColor: 'var(--bg-panel)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden', position: 'sticky', top: '24px' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.1)' }}>
            <h2 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.1rem' }}>Últimas Entradas Registradas</h2>
          </div>
          
          {loading ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando bitácora de almacén...</div>
          ) : (
            <div style={{ overflowX: 'auto', maxHeight: '600px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ position: 'sticky', top: 0, backgroundColor: 'var(--bg-panel)', zIndex: 1 }}>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.85rem' }}>LOTE / FECHA</th>
                    <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.85rem' }}>PRODUCTO & PROV.</th>
                    <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.85rem', textAlign: 'right' }}>COSTO</th>
                    <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.85rem', textAlign: 'center' }}>STOCK</th>
                  </tr>
                </thead>
                <tbody>
                  {lotes.map((lote) => {
                    const agotado = lote.cantidadDisponible <= 0;
                    return (
                      <tr key={lote.idLote} style={{ borderBottom: '1px solid var(--border-color)', opacity: agotado ? 0.6 : 1 }}>
                        <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                          <strong style={{ color: 'var(--text-main)', display: 'block' }}>Lote #{lote.idLote}</strong>
                          {formatearFecha(lote.fechaRegistro)}
                        </td>
                        <td style={{ padding: '16px', color: 'var(--text-main)', fontWeight: '500' }}>
                          {lote.producto?.nombre} <br/>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{lote.proveedor?.nombre}</span>
                        </td>
                        <td style={{ padding: '16px', color: 'var(--text-main)', textAlign: 'right' }}>${lote.precioCompra.toFixed(2)}</td>
                        <td style={{ padding: '16px', textAlign: 'center' }}>
                          <span style={{ fontSize: '0.8rem', backgroundColor: agotado ? 'rgba(255, 68, 68, 0.1)' : 'rgba(62, 207, 142, 0.1)', color: agotado ? '#ff4444' : '#3ECF8E', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                            {agotado ? 'Agotado' : `${lote.cantidadDisponible} / ${lote.cantidadInicial}`}
                          </span>
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