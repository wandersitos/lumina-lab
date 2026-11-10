import { useEffect, useState } from 'react';
import { siteConfig } from './config/site.js';

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
    <div className="app-container">
      {/* Header / Navbar con identidad de marca y accesos directos */}
      <header className="navbar">
        <a href="/" className="brand-link">
          <div className="brand-icon">L</div>
          <span className="brand-name">{siteConfig.name}</span>
        </a>
        <nav className="nav-social-links" aria-label="Redes sociales oficiales">
          <a
            href={siteConfig.social.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-social btn-instagram"
            aria-label="Instagram de Lumina Lab"
          >
            Instagram {siteConfig.social.instagram.handle}
          </a>
          <a
            href={siteConfig.social.whatsapp.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-social btn-whatsapp"
            aria-label="WhatsApp de Lumina Lab"
          >
            WhatsApp
          </a>
        </nav>
      </header>

      {/* Hero Section: Escaparate y propuesta de valor de Lumina Lab */}
      <main>
        <section className="hero">
          <span className="hero-badge">Tienda Oficial Lumina Lab</span>
          <h1 className="hero-title">
            Diseño e iluminación <span>impresa en 3D</span>
          </h1>
          <p className="hero-tagline">{siteConfig.tagline}</p>
          <div className="hero-actions">
            <a
              href={siteConfig.social.whatsapp.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-cta-primary"
            >
              Pedir por WhatsApp
            </a>
            <a
              href={siteConfig.social.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-cta-secondary"
            >
              Ver perfil en Instagram
            </a>
          </div>
        </section>

        {/* Sección de estado del sistema (no regresión con backend) */}
        <section className="status-section">
          <div className="card">
            <h3>Estado del servicio</h3>
            <p>
              Conexión backend:{' '}
              <span
                className={`status-badge ${
                  healthStatus === 'Error' ? 'error' : ''
                }`}
              >
                {healthStatus}
              </span>
            </p>
            {healthStatus === 'OK' && (
              <p className="success-msg">
                Conexión establecida exitosamente con la API de Django y la base de datos.
              </p>
            )}
            {errorDetails && <p className="error-msg">Detalle: {errorDetails}</p>}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
