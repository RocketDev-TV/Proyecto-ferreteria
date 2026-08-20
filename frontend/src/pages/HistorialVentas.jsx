import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const swalApp = Swal.mixin({
  background: '#2A2A2A',
  color: '#DEDEDE',
  confirmButtonColor: '#F25623',
  cancelButtonColor: '#4D4D4D',
  customClass: { popup: 'swal-custom-border' }
});

export default function HistorialVentas() {
  const [ventas, setVentas] = useState([]);
  const [detalles, setDetalles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Filtros de Búsqueda y Rango de Fechas
  const [searchTerm, setSearchTerm] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  // Ordenamiento (Sorting)
  const [sortConfig, setSortConfig] = useState({ key: 'idVenta', direction: 'desc' });

  useEffect(() => {
    cargarHistorial();
  }, []);

  const cargarHistorial = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [ventasRes, detallesRes] = await Promise.all([
        fetch('http://localhost:8080/api/ventas', { headers }),
        fetch('http://localhost:8080/api/ventas/detalles', { headers })
      ]);

      if (ventasRes.ok && detallesRes.ok) {
        const ventasData = await ventasRes.json();
        const detallesData = await detallesRes.json();
        setVentas(ventasData);
        setDetalles(detallesData);
      } else {
        setError('Acceso denegado. Verifique su sesión.');
      }
    } catch (err) {
      setError('Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  // --- HERRAMIENTAS DE CALENDARIO ---
  const formatInputDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const setFiltroHoy = () => {
    const hoy = formatInputDate(new Date());
    setFechaInicio(hoy);
    setFechaFin(hoy);
  };

  const setFiltroSemana = () => {
    const hoy = new Date();
    const diaSemana = hoy.getDay() === 0 ? 7 : hoy.getDay(); 
    
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() - diaSemana + 1);
    
    const domingo = new Date(lunes);
    domingo.setDate(lunes.getDate() + 6);

    setFechaInicio(formatInputDate(lunes));
    setFechaFin(formatInputDate(domingo));
  };

  const setFiltroMes = () => {
    const hoy = new Date();
    const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

    setFechaInicio(formatInputDate(primerDia));
    setFechaFin(formatInputDate(ultimoDia));
  };

  const formatearFecha = (fechaString) => {
    const opciones = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(fechaString).toLocaleDateString('es-MX', opciones);
  };

  // --- VISUALIZADOR DE TICKET ---
  const verTicket = (venta) => {
    const itemsVenta = detalles.filter(d => d.venta.idVenta === venta.idVenta);
    let htmlTabla = `
      <div style="text-align: left; margin-top: 15px;">
        <p style="margin: 0; color: #999; font-size: 0.9rem;">Cajero: ${venta.usuario.nombreCompleto}</p>
        <p style="margin: 5px 0 15px 0; color: #999; font-size: 0.9rem;">Fecha: ${formatearFecha(venta.fechaVenta)}</p>
        <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
          <thead>
            <tr style="border-bottom: 1px solid #4D4D4D; color: #999;">
              <th style="padding: 8px 0; text-align: left;">Producto</th>
              <th style="padding: 8px 0; text-align: center;">Cant</th>
              <th style="padding: 8px 0; text-align: right;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
    `;
    itemsVenta.forEach(item => {
      htmlTabla += `
        <tr style="border-bottom: 1px dashed #4D4D4D;">
          <td style="padding: 8px 0;">${item.producto.nombre}</td>
          <td style="padding: 8px 0; text-align: center;">${item.cantidad}</td>
          <td style="padding: 8px 0; text-align: right;">$${item.subtotal.toFixed(2)}</td>
        </tr>
      `;
    });
    htmlTabla += `
          </tbody>
        </table>
        <div style="text-align: right; margin-top: 15px; font-size: 1.2rem; font-weight: bold; color: #F25623;">
          Total: $${venta.totalVenta.toFixed(2)}
        </div>
      </div>
    `;
    swalApp.fire({
      title: `Folio #${venta.idVenta.toString().padStart(5, '0')}`,
      html: htmlTabla,
      width: '500px',
      confirmButtonText: 'Cerrar Ticket'
    });
  };

  // --- LÓGICA DE ORDENAMIENTO (SORTING) ---
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' 
      ? <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '6px', verticalAlign: 'text-bottom' }} viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"></polyline></svg>
      : <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '6px', verticalAlign: 'text-bottom' }} viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"></polyline></svg>;
  };

  // --- APLICACIÓN DE FILTROS EN FRONTAL ---
  let ventasFiltradas = ventas.filter(v => {
    const matchSearch = v.idVenta.toString().includes(searchTerm) || v.usuario.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchFechas = true;
    const ventaDate = new Date(v.fechaVenta);
    ventaDate.setHours(0, 0, 0, 0); 

    if (fechaInicio) {
      const start = new Date(`${fechaInicio}T00:00:00`);
      if (ventaDate < start) matchFechas = false;
    }
    if (fechaFin) {
      const end = new Date(`${fechaFin}T00:00:00`);
      if (ventaDate > end) matchFechas = false;
    }

    return matchSearch && matchFechas;
  });

  if (sortConfig.key !== null) {
    ventasFiltradas.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (sortConfig.key === 'fechaVenta') {
        aValue = new Date(a.fechaVenta).getTime();
        bValue = new Date(b.fechaVenta).getTime();
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // --- CÁLCULOS DEL CORTE ---
  const totalCorte = ventasFiltradas.reduce((sum, v) => sum + v.totalVenta, 0);
  const ticketsEmitidos = ventasFiltradas.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
      
      {/* Cabecera */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.5rem', fontWeight: '600' }}>Resumen Financiero</h1>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Auditoría, trazabilidad y cortes de caja</p>
        </div>
        <button onClick={cargarHistorial} style={{ padding: '10px 16px', backgroundColor: 'transparent', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '6px', fontWeight: '500', cursor: 'pointer' }}>
          ↻ Sincronizar Datos
        </button>
      </div>

      {/* PANEL DE CORTE (KPIs) */}
      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ flex: 1, backgroundColor: 'var(--bg-panel)', padding: '24px', borderRadius: '10px', border: '1px solid var(--border-color)', borderLeft: '4px solid var(--accent)' }}>
          <p style={{ margin: '0 0 8px 0', color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Ingresos del Rango Seleccionado</p>
          <h2 style={{ margin: 0, color: 'var(--text-main)', fontSize: '2.5rem' }}>${totalCorte.toFixed(2)}</h2>
        </div>
        <div style={{ flex: 1, backgroundColor: 'var(--bg-panel)', padding: '24px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
          <p style={{ margin: '0 0 8px 0', color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Operaciones Realizadas</p>
          <h2 style={{ margin: 0, color: 'var(--text-main)', fontSize: '2.5rem' }}>{ticketsEmitidos} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>tickets</span></h2>
        </div>
      </div>

      {/* CONTROLES DE FECHAS REDISEÑADOS */}
      <div style={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
          
          {/* Inputs de Fechas */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: '1 1 auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, maxWidth: '240px' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Rango de Inicio</label>
              <input 
                type="date" 
                value={fechaInicio} 
                onChange={(e) => setFechaInicio(e.target.value)} 
                style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none', fontFamily: 'inherit', fontSize: '0.95rem', transition: 'border-color 0.2s' }} 
                onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
              />
            </div>
            
            <div style={{ color: 'var(--text-muted)', paddingBottom: '4px' }}>
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, maxWidth: '240px' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Límite de Fin</label>
              <input 
                type="date" 
                value={fechaFin} 
                onChange={(e) => setFechaFin(e.target.value)} 
                style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none', fontFamily: 'inherit', fontSize: '0.95rem', transition: 'border-color 0.2s' }} 
                onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
              />
            </div>
          </div>

          {/* Botones de Acción Rápida */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            
            <button 
              onClick={setFiltroHoy} 
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500', transition: 'all 0.2s' }}
              onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--text-muted)'; }}
              onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Corte de Hoy
            </button>

            <button 
              onClick={setFiltroSemana} 
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500', transition: 'all 0.2s' }}
              onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--text-muted)'; }}
              onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Esta Semana
            </button>
            
            <button 
              onClick={setFiltroMes} 
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500', transition: 'all 0.2s' }}
              onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--text-muted)'; }}
              onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>
              Este Mes
            </button>

            <div style={{ height: '30px', width: '1px', backgroundColor: 'var(--border-color)', margin: '0 4px' }}></div>

            <button 
              onClick={() => { setFechaInicio(''); setFechaFin(''); }} 
              title="Restablecer filtros"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', backgroundColor: 'rgba(255, 68, 68, 0.1)', color: '#ff4444', border: '1px solid transparent', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 68, 68, 0.2)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 68, 68, 0.1)'}
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Contenedor Principal de la Tabla */}
      <div style={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden' }}>
        
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.1)' }}>
          <input 
            type="text" 
            placeholder="Filtrar resultados por Folio o Cajero..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', maxWidth: '400px', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none' }}
          />
        </div>

        {error && <div style={{ padding: '16px', backgroundColor: 'rgba(255, 68, 68, 0.1)', color: '#ff4444' }}>{error}</div>}
        {loading && <div style={{ padding: '16px', color: 'var(--text-muted)' }}>Cargando registros transaccionales...</div>}

        {!loading && !error && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'rgba(0,0,0,0.2)', borderBottom: '1px solid var(--border-color)' }}>
                  <th onClick={() => requestSort('idVenta')} style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.85rem', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none' }}>
                    Folio {getSortIndicator('idVenta')}
                  </th>
                  <th onClick={() => requestSort('fechaVenta')} style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.85rem', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none' }}>
                    Fecha y Hora {getSortIndicator('fechaVenta')}
                  </th>
                  <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                    Cajero
                  </th>
                  <th onClick={() => requestSort('totalVenta')} style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.85rem', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none' }}>
                    Total Cobrado {getSortIndicator('totalVenta')}
                  </th>
                  <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.85rem', textTransform: 'uppercase', textAlign: 'center' }}>
                    Ticket
                  </th>
                </tr>
              </thead>
              <tbody>
                {ventasFiltradas.map((venta) => (
                  <tr key={venta.idVenta} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '16px', color: 'var(--text-main)', fontWeight: '500' }}>
                      #{venta.idVenta.toString().padStart(5, '0')}
                    </td>
                    <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      {formatearFecha(venta.fechaVenta)}
                    </td>
                    <td style={{ padding: '16px', color: 'var(--text-main)' }}>
                      {venta.usuario.nombreCompleto}
                    </td>
                    <td style={{ padding: '16px', color: 'var(--accent)', fontWeight: 'bold' }}>
                      ${venta.totalVenta.toFixed(2)}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <button 
                        onClick={() => verTicket(venta)} 
                        title="Auditar Ticket"
                        style={{ background: 'none', border: 'none', color: '#47bfff', cursor: 'pointer', transition: 'color 0.2s' }}
                        onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-main)'}
                        onMouseOut={(e) => e.currentTarget.style.color = '#47bfff'}
                      >
                        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1z"/>
                          <line x1="16" y1="8" x2="8" y2="8"/>
                          <line x1="16" y1="12" x2="8" y2="12"/>
                          <line x1="12" y1="16" x2="8" y2="16"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
                {ventasFiltradas.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No hay registros en el rango de fechas seleccionado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}