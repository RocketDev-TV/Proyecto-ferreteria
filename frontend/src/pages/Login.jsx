import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // <-- Estado para el ojito
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombreUsuario: username, contrasena: password })
      });

      if (response.ok) {
        const data = await response.json(); 
        
        localStorage.setItem('token', data.token);
        localStorage.setItem('nombreCompleto', data.nombreCompleto);
        localStorage.setItem('rol', data.rol);

        if (data.rol === 'CAJERO') {
          navigate('/ventas'); 
        } else {
          navigate('/dashboard'); 
        }
      } else {
        setError('Las credenciales proporcionadas son inválidas.');
      }
    } catch (err) {
      setError('Ocurrió un error al intentar conectar con el servidor.');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw', backgroundColor: 'var(--bg-main)' }}>
      <div style={{ backgroundColor: 'var(--bg-panel)', padding: '40px', borderRadius: '12px', border: '1px solid var(--border-color)', width: '100%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
        
        <h2 style={{ color: 'var(--text-main)', textAlign: 'center', marginBottom: '8px' }}>Bienvenido</h2>
        <p style={{ color: 'var(--accent)', textAlign: 'center', marginBottom: '32px', fontWeight: 'bold' }}>PRO-FERRETERÍA</p>
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Input de Usuario */}
          <input 
            type="text" 
            placeholder="Nombre de usuario" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none' }}
          />
          
          {/* Contenedor del Input de Contraseña con el Ojito */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Contraseña" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '12px', paddingRight: '40px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none' }}
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? (
                // Icono de "Ojo cerrado" (SVG)
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22"/></svg>
              ) : (
                // Icono de "Ojo abierto" (SVG)
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              )}
            </button>
          </div>

          <button type="submit" style={{ padding: '12px', cursor: 'pointer', backgroundColor: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', marginTop: '10px' }}>
            Ingresar al Sistema
          </button>
          {error && <p style={{ color: '#ff4444', textAlign: 'center', margin: 0, fontSize: '0.9rem' }}>{error}</p>}
        </form>
      </div>
    </div>
  );
}