import { useEffect, useState } from 'react';

function App() {
  const [healthStatus, setHealthStatus] = useState('Conectando...');
  const [errorDetails, setErrorDetails] = useState(null);
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    fetch(`${apiUrl}/api/health/`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data.status === 'OK') {
          setHealthStatus('OK');
        } else {
          setHealthStatus('Error');
          setErrorDetails(data.detail || 'Respuesta inesperada');
        }
      })
      .catch((err) => {
        setHealthStatus('Error');
        setErrorDetails(err.message);
      });
  }, [apiUrl]);

  return (
    <div className="card">
      <h1>The Gift Club</h1>
      <h2>Esqueleto Andante</h2>
      <p>
        Estado del backend: <span className="status-badge">{healthStatus}</span>
      </p>
      {healthStatus === 'OK' && (
        <p className="success-msg">
          Conexión establecida exitosamente con la API de Django y la base de datos.
        </p>
      )}
      {errorDetails && <p className="error-msg">Detalle: {errorDetails}</p>}
    </div>
  );
}

export default App;

