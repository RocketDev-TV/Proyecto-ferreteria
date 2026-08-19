import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './components/Layout';
import Inventario from './pages/Inventario';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública (Sin menú lateral) */}
        <Route path="/" element={<Login />} />
        
        {/* Rutas privadas (Envueltas en el Layout con menú lateral) */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={
            <div>
              <h1 style={{ marginTop: 0, color: 'var(--text-main)' }}>Resumen General</h1>
              <p style={{ color: 'var(--text-muted)' }}>Bienvenido al sistema. Aquí irán las gráficas de BI más adelante.</p>
            </div>
          } />
          
          <Route path="/inventario" element={<Inventario />} />
          
          <Route path="/ventas" element={
            <div>
              <h1 style={{ marginTop: 0, color: 'var(--text-main)' }}>Punto de Venta</h1>
            </div>
          } />
          
          <Route path="/ventas" element={
            <div>
              <h1 style={{ marginTop: 0, color: 'var(--text-main)' }}>Caja / POS</h1>
            </div>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;