import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const swalApp = Swal.mixin({
  background: '#2A2A2A',
  color: '#DEDEDE',
  confirmButtonColor: '#F25623',
  cancelButtonColor: '#4D4D4D',
  customClass: { popup: 'swal-custom-border' }
});

export default function Ventas() {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Traemos un bloque grande de productos para tenerlos listos en el POS
      const response = await fetch('http://localhost:8080/api/productos?page=0&size=50', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setProductos(data.content);
      }
    } catch (err) {
      console.error('Error al cargar catálogo', err);
    } finally {
      setLoading(false);
    }
  };

  // --- LÓGICA DEL CARRITO ---
  const agregarAlCarrito = (producto) => {
    setCarrito((prev) => {
      const existe = prev.find(item => item.producto.idProducto === producto.idProducto);
      
      if (existe) {
        // Bloqueo si intentan agregar más del stock físico
        if (existe.cantidad >= producto.stockTotal) {
          swalApp.fire({
            icon: 'warning',
            title: 'Stock Límite Alcanzado',
            text: 'No hay más unidades disponibles en almacén para este producto.',
            timer: 2000,
            showConfirmButton: false
          });
          return prev;
        }
        return prev.map(item => 
          item.producto.idProducto === producto.idProducto
            ? { ...item, cantidad: item.cantidad + 1, subtotal: (item.cantidad + 1) * producto.precioVentaAct }
            : item
        );
      }
      // Agregar nuevo si hay stock
      if (producto.stockTotal > 0) {
        return [...prev, { producto, cantidad: 1, subtotal: producto.precioVentaAct }];
      }
      return prev;
    });
  };

  const modificarCantidad = (idProducto, delta) => {
    setCarrito((prev) => {
      return prev.map(item => {
        if (item.producto.idProducto === idProducto) {
          const nuevaCantidad = item.cantidad + delta;
          if (nuevaCantidad > item.producto.stockTotal) {
            swalApp.fire('Límite Excedido', 'No hay suficiente stock.', 'warning');
            return item;
          }
          if (nuevaCantidad === 0) return null; // Marca para eliminar
          return { ...item, cantidad: nuevaCantidad, subtotal: nuevaCantidad * item.producto.precioVentaAct };
        }
        return item;
      }).filter(item => item !== null); // Limpia los que llegaron a 0
    });
  };

  // --- LÓGICA TRANSACCIONAL DE VENTA ---
  const procesarVenta = async () => {
    if (carrito.length === 0) return;
    setIsProcessing(true);

    try {
      const token = localStorage.getItem('token');
      const totalVenta = carrito.reduce((sum, item) => sum + item.subtotal, 0);

      // 1. Registrar la Cabecera de la Venta
      const ventaRes = await fetch('http://localhost:8080/api/ventas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ idUsuario: 2, totalVenta: totalVenta })
      });

      if (!ventaRes.ok) throw new Error('Error al generar folio de venta');
      const ventaData = await ventaRes.json();

      // 2. Registrar Detalles y Descontar Stock
      for (const item of carrito) {
        await fetch('http://localhost:8080/api/ventas/detalles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            idVenta: ventaData.idVenta,
            idProducto: item.producto.idProducto,
            cantidad: item.cantidad,
            precioUnitario: item.producto.precioVentaAct,
            precioCompraHistorico: item.producto.precioVentaAct * 0.7, // Simulación de costo PEPS
            subtotal: item.subtotal
          })
        });
      }

      swalApp.fire({
        icon: 'success',
        title: 'Transacción Exitosa',
        text: `Se cobró un total de $${totalVenta.toFixed(2)}`,
        confirmButtonText: 'Nueva Venta'
      });
      
      setCarrito([]);
      fetchProductos(); // Refrescamos para ver el stock actualizado

    } catch (error) {
      swalApp.fire('Error de Transacción', 'Ocurrió un problema al procesar el cobro. Verifique la conexión.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const totalGlobal = carrito.reduce((sum, item) => sum + item.subtotal, 0);
  const productosFiltrados = productos.filter(p => p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || p.idProducto.toString().includes(searchTerm));

  return (
    <div style={{ display: 'flex', height: '100%', gap: '24px' }}>
      
      {/* PANEL IZQUIERDO: Catálogo */}
      <div style={{ flex: '2', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <h1 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.5rem', fontWeight: '600' }}>Punto de Venta</h1>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Seleccione los artículos para agregarlos al ticket</p>
        </div>

        <input 
          type="text" 
          placeholder="Escanear SKU o buscar por nombre..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-panel)', color: 'var(--text-main)', outline: 'none', fontSize: '1rem' }}
        />

        {loading ? (
          <div style={{ color: 'var(--text-muted)' }}>Cargando catálogo...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', overflowY: 'auto', paddingRight: '8px' }}>
            {productosFiltrados.map((producto) => {
              const sinStock = producto.stockTotal <= 0;
              return (
                <div 
                  key={producto.idProducto} 
                  onClick={() => !sinStock && agregarAlCarrito(producto)}
                  style={{ 
                    backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '16px', 
                    cursor: sinStock ? 'not-allowed' : 'pointer', transition: 'all 0.2s', opacity: sinStock ? 0.5 : 1,
                    display: 'flex', flexDirection: 'column', gap: '8px'
                  }}
                  onMouseOver={(e) => { if(!sinStock) e.currentTarget.style.borderColor = 'var(--accent)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                >
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>#{producto.idProducto.toString().padStart(4, '0')}</span>
                  <strong style={{ color: 'var(--text-main)', fontSize: '1rem', lineHeight: '1.2' }}>{producto.nombre}</strong>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '12px' }}>
                    <span style={{ color: 'var(--accent)', fontWeight: 'bold', fontSize: '1.1rem' }}>${producto.precioVentaAct.toFixed(2)}</span>
                    <span style={{ fontSize: '0.8rem', color: sinStock ? '#ff4444' : 'var(--text-muted)', backgroundColor: 'rgba(0,0,0,0.2)', padding: '4px 8px', borderRadius: '4px' }}>
                      {sinStock ? 'Agotado' : `${producto.stockTotal} und`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PANEL DERECHO: El Ticket */}
      <div style={{ flex: '1', backgroundColor: 'var(--bg-panel)', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.1)' }}>
          <h2 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.2rem', textAlign: 'center' }}>Ticket de Venta</h2>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {carrito.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '40px' }}>
              El carrito está vacío.
            </div>
          ) : (
            carrito.map(item => (
              <div key={item.producto.idProducto} style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderBottom: '1px dashed var(--border-color)', paddingBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-main)', fontWeight: '500' }}>{item.producto.nombre}</span>
                  <span style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>${item.subtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>${item.producto.precioVentaAct.toFixed(2)} c/u</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: 'var(--bg-main)', borderRadius: '6px', border: '1px solid var(--border-color)', padding: '4px' }}>
                    <button onClick={() => modificarCantidad(item.producto.idProducto, -1)} style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', padding: '0 8px' }}>-</button>
                    <span style={{ color: 'var(--text-main)', fontSize: '0.9rem', width: '20px', textAlign: 'center' }}>{item.cantidad}</span>
                    <button onClick={() => modificarCantidad(item.producto.idProducto, 1)} style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', padding: '0 8px' }}>+</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{ padding: '24px', backgroundColor: 'rgba(0,0,0,0.2)', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>Total:</span>
            <span style={{ color: 'var(--accent)', fontSize: '2rem', fontWeight: 'bold', lineHeight: '1' }}>${totalGlobal.toFixed(2)}</span>
          </div>
          <button 
            onClick={procesarVenta}
            disabled={carrito.length === 0 || isProcessing}
            style={{ 
              width: '100%', padding: '16px', backgroundColor: (carrito.length === 0 || isProcessing) ? 'var(--border-color)' : 'var(--accent)', 
              color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', 
              cursor: (carrito.length === 0 || isProcessing) ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s' 
            }}
          >
            {isProcessing ? 'Procesando...' : 'Cobrar e Imprimir'}
          </button>
        </div>
      </div>

    </div>
  );
}