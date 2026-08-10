import { useState, useEffect } from 'react';

function App() {
  // Aquí guardamos los datos que lleguen del backend
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    // Le pegamos a la ruta que acabas de probar con el curl
    fetch('http://localhost:8080/api/categorias')
      .then(response => response.json())
      .then(data => {
        console.log("¡Datos recibidos del back!", data);
        setCategorias(data);
      })
      .catch(error => console.error('Pum, error en la matrix:', error));
  }, []); // Los corchetes vacíos hacen que esto corra solo una vez al cargar

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', color: 'white' }}>
      <h1>🔧 Catálogo de Categorías (Pro-Ferretería)</h1>
      
      {categorias.length === 0 ? (
        <p>Cargando datos desde Spring Boot...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          {categorias.map((cat) => (
            <div 
              key={cat.idCategoria} 
              style={{ padding: '1rem', border: '1px solid #444', borderRadius: '8px', backgroundColor: '#222' }}
            >
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#646cff' }}>{cat.nombre}</h3>
              <p style={{ margin: 0 }}>{cat.descripcion}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;