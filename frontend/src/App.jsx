import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './components/Layout';
import Inventario from './pages/Inventario';
import Ventas from './pages/Ventas';
import HistorialVentas from './pages/HistorialVentas';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        
        <Route element={<Layout />}>
          <Route path="/dashboard" element={
            <div>
              <h1 style={{ marginTop: 0, color: 'var(--text-main)' }}>Resumen General</h1>
              <p style={{ color: 'var(--text-muted)' }}>Módulo en desarrollo...</p>
            </div>
          } />
          <Route path="/inventario" element={<Inventario />} />
          <Route path="/ventas" element={<Ventas />} />
          <Route path="/historial" element={<HistorialVentas />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;