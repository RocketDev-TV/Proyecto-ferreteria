import { useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
  BarChart, Bar, LabelList
} from 'recharts';

export default function Dashboard() {
  const [ventas, setVentas] = useState([]);
  const [detalles, setDetalles] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatosBI();
  }, []);

  const cargarDatosBI = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [ventasRes, detallesRes, prodRes] = await Promise.all([
        fetch('http://localhost:8080/api/ventas', { headers }),
        fetch('http://localhost:8080/api/ventas/detalles', { headers }),
        fetch('http://localhost:8080/api/productos?page=0&size=1000', { headers })
      ]);

      if (ventasRes.ok && detallesRes.ok && prodRes.ok) {
        setVentas(await ventasRes.json());
        setDetalles(await detallesRes.json());
        const prodData = await prodRes.json();
        setProductos(prodData.content || prodData);
      }
    } catch (err) {
      console.error('Error al cargar datos para BI:', err);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // MOTOR DE CÁLCULO FINANCIERO (BI)
  // ==========================================
  
  const hace30Dias = new Date();
  hace30Dias.setDate(hace30Dias.getDate() - 30);
  
  const ventasMes = ventas.filter(v => new Date(v.fechaVenta) >= hace30Dias);
  const detallesMes = detalles.filter(d => ventasMes.some(v => v.idVenta === d.venta.idVenta));

  const ingresosBrutos = ventasMes.reduce((sum, v) => sum + v.totalVenta, 0);
  const ticketPromedio = ventasMes.length > 0 ? ingresosBrutos / ventasMes.length : 0;
  
  const costoTotalMercancia = detallesMes.reduce((sum, d) => sum + (d.precioCompraHistorico * d.cantidad), 0);
  const utilidadNeta = ingresosBrutos - costoTotalMercancia;

  const valorInventario = productos.reduce((sum, p) => sum + (p.stockTotal * p.precioVentaAct), 0);

  const ventasPorDia = {};
  ventasMes.forEach(v => {
    const fechaStr = new Date(v.fechaVenta).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' });
    if (!ventasPorDia[fechaStr]) {
      ventasPorDia[fechaStr] = { fecha: fechaStr, ingresos: 0, ganancia: 0 };
    }
    ventasPorDia[fechaStr].ingresos += v.totalVenta;
    
    const itemsTicket = detallesMes.filter(d => d.venta.idVenta === v.idVenta);
    const costoTicket = itemsTicket.reduce((sum, d) => sum + (d.precioCompraHistorico * d.cantidad), 0);
    ventasPorDia[fechaStr].ganancia += (v.totalVenta - costoTicket);
  });
  const dataGraficaTendencia = Object.values(ventasPorDia);

  const ventasPorProducto = {};
  detallesMes.forEach(d => {
    const nombre = d.producto.nombre;
    if (!ventasPorProducto[nombre]) {
      ventasPorProducto[nombre] = { nombre: nombre, cantidad: 0 };
    }
    ventasPorProducto[nombre].cantidad += d.cantidad;
  });
  const dataTopProductos = Object.values(ventasPorProducto)
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 5);

  const alertasStock = productos.filter(p => p.stockTotal <= 5).sort((a, b) => a.stockTotal - b.stockTotal);


  if (loading) {
    return <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '50px' }}>Analizando finanzas y procesando reportes...</div>;
  }

  const KpiCard = ({ titulo, valor, subtitulo, colorBorde }) => (
    <div style={{ flex: 1, backgroundColor: 'var(--bg-panel)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)', borderBottom: `4px solid ${colorBorde}`, minWidth: '200px' }}>
      <p style={{ margin: '0 0 8px 0', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>{titulo}</p>
      <h2 style={{ margin: 0, color: 'var(--text-main)', fontSize: '2rem' }}>{valor}</h2>
      <p style={{ margin: '8px 0 0 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{subtitulo}</p>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.8rem', fontWeight: '600' }}>Business Intelligence</h1>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.95rem' }}>Análisis financiero de los últimos 30 días</p>
        </div>
        <button onClick={cargarDatosBI} style={{ padding: '10px 16px', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer' }}>
          ↻ Actualizar Métricas
        </button>
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <KpiCard titulo="Ingresos Brutos" valor={`$${ingresosBrutos.toFixed(2)}`} subtitulo={`${ventasMes.length} tickets emitidos`} colorBorde="#47bfff" />
        <KpiCard titulo="Utilidad Neta" valor={`$${utilidadNeta.toFixed(2)}`} subtitulo="Ganancia real tras costo de mercancía" colorBorde="#3ECF8E" />
        <KpiCard titulo="Ticket Promedio" valor={`$${ticketPromedio.toFixed(2)}`} subtitulo="Gasto promedio por cliente" colorBorde="#F25623" />
        <KpiCard titulo="Valor de Inventario" valor={`$${valorInventario.toFixed(2)}`} subtitulo="Capital invertido en anaquel" colorBorde="#9b59b6" />
      </div>

      {/* ========================================== */}
      {/* NIVEL 2: GRÁFICAS REPOTENCIADAS           */}
      {/* ========================================== */}
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        
        <div style={{ flex: '2', minWidth: '400px', backgroundColor: 'var(--bg-panel)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ margin: '0 0 24px 0', color: 'var(--text-main)', fontSize: '1.1rem' }}>Flujo de Caja vs Ganancia Neta</h3>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer>
              <AreaChart data={dataGraficaTendencia} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIngreso" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#47bfff" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#47bfff" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorGanancia" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3ECF8E" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3ECF8E" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#4D4D4D" vertical={false} />
                <XAxis dataKey="fecha" stroke="#999" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#999" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#2A2A2A', borderColor: '#4D4D4D', color: '#DEDEDE', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value) => [`$${value.toFixed(2)}`, undefined]} // Formato de moneda explícito
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '0.9rem', color: '#DEDEDE' }} />
                
                {/* Agregamos los "dots" para marcar explícitamente cada día de venta */}
                <Area type="monotone" name="Ingresos Brutos" dataKey="ingresos" stroke="#47bfff" strokeWidth={3} fillOpacity={1} fill="url(#colorIngreso)" dot={{ r: 4, strokeWidth: 2, fill: 'var(--bg-panel)' }} activeDot={{ r: 6 }} />
                <Area type="monotone" name="Ganancia Neta" dataKey="ganancia" stroke="#3ECF8E" strokeWidth={3} fillOpacity={1} fill="url(#colorGanancia)" dot={{ r: 4, strokeWidth: 2, fill: 'var(--bg-panel)' }} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ flex: '1', minWidth: '300px', backgroundColor: 'var(--bg-panel)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ margin: '0 0 24px 0', color: 'var(--text-main)', fontSize: '1.1rem' }}>Artículos Más Vendidos</h3>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer>
              {/* Le dimos más margen derecho (right: 50) para que quepan los números */}
              <BarChart data={dataTopProductos} layout="vertical" margin={{ top: 0, right: 50, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4D4D4D" horizontal={false} />
                <XAxis type="number" stroke="#999" fontSize={12} hide />
                <YAxis dataKey="nombre" type="category" stroke="#DEDEDE" fontSize={11} tickLine={false} axisLine={false} width={120} />
                <RechartsTooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  contentStyle={{ backgroundColor: '#2A2A2A', borderColor: '#4D4D4D', color: '#DEDEDE', borderRadius: '8px' }}
                  formatter={(value) => [`${value} unidades`, 'Cantidad Vendida']}
                />
                <Bar name="Cantidad Vendida" dataKey="cantidad" fill="#F25623" radius={[0, 4, 4, 0]} barSize={24}>
                  {/* MAGIA AQUÍ: Etiqueta numérica pegada a la barra */}
                  <LabelList dataKey="cantidad" position="right" fill="#DEDEDE" fontSize={13} fontWeight="bold" formatter={(val) => `${val} und`} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* NIVEL 3: Alertas Operativas */}
      <div style={{ backgroundColor: 'var(--bg-panel)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
        <h3 style={{ margin: '0 0 16px 0', color: 'var(--text-main)', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#ff4444' }}>⚠️</span> Alertas de Reabastecimiento Crítico
        </h3>
        
        {alertasStock.length === 0 ? (
          <p style={{ color: '#3ECF8E', margin: 0 }}>Todo el inventario cuenta con stock saludable.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '12px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>SKU</th>
                  <th style={{ padding: '12px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Producto</th>
                  <th style={{ padding: '12px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Stock Actual</th>
                  <th style={{ padding: '12px 0', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'right' }}>Acción Recomendada</th>
                </tr>
              </thead>
              <tbody>
                {alertasStock.map(p => (
                  <tr key={p.idProducto} style={{ borderBottom: '1px dashed var(--border-color)' }}>
                    <td style={{ padding: '12px 0', color: 'var(--text-muted)' }}>#{p.idProducto.toString().padStart(4, '0')}</td>
                    <td style={{ padding: '12px 0', color: 'var(--text-main)' }}>{p.nombre}</td>
                    <td style={{ padding: '12px 0' }}>
                      <span style={{ backgroundColor: p.stockTotal === 0 ? 'rgba(255, 68, 68, 0.1)' : 'rgba(242, 169, 0, 0.1)', color: p.stockTotal === 0 ? '#ff4444' : '#F2A900', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.85rem' }}>
                        {p.stockTotal} unidades
                      </span>
                    </td>
                    <td style={{ padding: '12px 0', textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      Contactar proveedor
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}