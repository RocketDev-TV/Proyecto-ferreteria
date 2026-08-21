import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Estados para la info del usuario
  const [userName, setUserName] = useState('Usuario');
  const [userRole, setUserRole] = useState('CAJERO');

  useEffect(() => {
    // Al cargar el layout, leemos quién se logueó desde el almacenamiento local
    const nombre = localStorage.getItem('nombreCompleto') || 'Usuario';
    const rol = localStorage.getItem('rol') || 'CAJERO';
    setUserName(nombre);
    setUserRole(rol);
  }, []);

  const handleLogout = () => {
    localStorage.clear(); // Borramos toda la evidencia
    navigate('/');
  };

  // Le agregamos la propiedad "roles" a cada ítem para saber quién puede verlo
  const allMenuItems = [
    { 
      path: '/dashboard', 
      label: 'Dashboard',
      roles: ['ADMIN'], // Solo el jefe
      icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
    },
    { 
      path: '/inventario', 
      label: 'Inventario',
      roles: ['ADMIN'],
      icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
    },
    { 
      path: '/ventas', 
      label: 'Punto de Venta',
      roles: ['ADMIN', 'CAJERO'], // ¡Ambos pueden vender!
      icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
    },
    { 
      path: '/historial', 
      label: 'Historial',
      roles: ['ADMIN'],
      icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
    },
    { 
      path: '/lotes', 
      label: 'Entradas (Lotes)',
      roles: ['ADMIN'],
      icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
    },
    { 
      path: '/proveedores', 
      label: 'Proveedores',
      roles: ['ADMIN'],
      icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    },
    { 
      path: '/usuarios', 
      label: 'Control de Accesos',
      roles: ['ADMIN'],
      icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
    }
  ];

  // Filtramos el menú para que solo dibuje lo que su rol tiene permitido
  const allowedMenu = allMenuItems.filter(item => item.roles.includes(userRole));

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: 'var(--bg-main)' }}>
      {/* SIDEBAR */}
      <aside style={{ width: '260px', backgroundColor: 'var(--bg-panel)', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)' }}>
          <h2 style={{ margin: 0, color: 'var(--accent)', fontSize: '1.2rem', letterSpacing: '1px' }}>PRO-FERRETERÍA</h2>
        </div>
        
        <nav style={{ padding: '24px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {allowedMenu.map(item => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', 
                  borderRadius: '8px', textDecoration: 'none', 
                  color: isActive ? 'white' : 'var(--text-muted)',
                  backgroundColor: isActive ? 'var(--accent)' : 'transparent',
                  transition: 'all 0.2s ease'
                }}
              >
                {item.icon}
                <span style={{ fontWeight: isActive ? '600' : '500' }}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '24px 12px', borderTop: '1px solid var(--border-color)' }}>
          <button 
            onClick={handleLogout}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', backgroundColor: 'transparent', border: 'none', color: '#ff4444', cursor: 'pointer', textAlign: 'left', fontSize: '1rem', fontWeight: '500' }}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* HEADER SUPERIOR CON EL NOMBRE REAL */}
        <header style={{ height: '70px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-panel)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Panel de {userRole === 'ADMIN' ? 'Administración' : 'Ventas'}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{userName}</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
              {userName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* CONTENIDO (Outlet) */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}