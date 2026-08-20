import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const menuItems = [
    { 
      path: '/dashboard', 
      label: 'Dashboard',
      icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
    },
    { 
      path: '/inventario', 
      label: 'Inventario',
      icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 240 240" viewBox="0 0 24 24"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.27 6.96 8.73 5.05 8.73-5.05"/><path d="M12 22.08V12"/></svg>
    },
    { 
      path: '/ventas', 
      label: 'Punto de Venta',
      icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
    },
    { 
      path: '/historial', 
      label: 'Historial',
      icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
    },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: 'var(--bg-main)' }}>
      
      {/* SIDEBAR */}
      <aside style={{ width: '260px', backgroundColor: 'var(--bg-panel)', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
        
        {/* LOGO */}
        <div style={{ padding: '28px 24px', fontSize: '1.25rem', fontWeight: '800', color: 'var(--accent)', borderBottom: '1px solid var(--border-color)', letterSpacing: '0.5px' }}>
          PRO-FERRETERÍA
        </div>
        
        {/* NAVEGACIÓN */}
        <nav style={{ flex: 1, padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {menuItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', textDecoration: 'none',
                  color: isActive ? '#fff' : 'var(--text-muted)',
                  backgroundColor: isActive ? 'var(--accent)' : 'transparent',
                  fontWeight: isActive ? '600' : 'normal',
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* BOTÓN CERRAR SESIÓN LIMPIO */}
        <div style={{ padding: '20px 16px', borderTop: '1px solid var(--border-color)' }}>
          <button 
            onClick={handleLogout} 
            style={{ 
              width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', 
              backgroundColor: 'transparent', color: '#ff6b6b', border: 'none', borderRadius: '8px', 
              cursor: 'pointer', fontWeight: '500', transition: 'background-color 0.2s' 
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 107, 107, 0.1)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* TOP BAR */}
        <header style={{ height: '70px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', padding: '0 32px', justifyContent: 'space-between', backgroundColor: 'var(--bg-main)' }}>
          <h2 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: '500' }}>Panel de Administración</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Administrador</span>
            <div style={{ width: '35px', height: '35px', borderRadius: '50%', backgroundColor: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff' }}>
              A
            </div>
          </div>
        </header>

        {/* CONTENIDO */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
          <Outlet />
        </div>
      </main>
      
    </div>
  );
}