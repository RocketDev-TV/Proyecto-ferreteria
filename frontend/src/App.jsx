import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './components/Layout';
import Inventario from './pages/Inventario';
import Ventas from './pages/Ventas';
import HistorialVentas from './pages/HistorialVentas';
import Lotes from './pages/Lotes';
import Proveedores from './pages/Proveedores';
import Dashboard from './pages/Dashboard';
import Usuarios from './pages/Usuarios';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/inventario" element={<Inventario />} />
          <Route path="/ventas" element={<Ventas />} />
          <Route path="/historial" element={<HistorialVentas />} />
          <Route path="/lotes" element={<Lotes />} />
          <Route path="/proveedores" element={<Proveedores />} />
          <Route path="/usuarios" element={<Usuarios />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;