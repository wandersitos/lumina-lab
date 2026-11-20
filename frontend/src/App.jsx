import { useEffect, useState } from 'react';
import { siteConfig } from './config/site.js';
import ProductGrid from './components/ProductGrid.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import CheckoutModal from './components/CheckoutModal.jsx';
import { CartProvider, useCart } from './context/CartContext.jsx';

function NavbarContent() {
  const { totalItems, setIsCartOpen } = useCart();

  return (
    <header className="navbar">
      <a href="/" className="brand-link">
        <div className="brand-icon">L</div>
        <span className="brand-name">{siteConfig.name}</span>
      </a>
      <div className="navbar-right">
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
        <button
          type="button"
          className="btn-cart-nav"
          onClick={() => setIsCartOpen(true)}
          aria-label="Abrir carrito de compras"
        >
          <span className="cart-nav-icon">🛒</span>
          <span className="cart-nav-text">Carrito</span>
          {totalItems > 0 && <span className="cart-nav-badge">{totalItems}</span>}
        </button>
      </div>
    </header>
  );
}

function MainApp() {
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
      {/* Header / Navbar con identidad de marca y botón de carrito */}
      <NavbarContent />

      {/* Hero Section: Escaparate y propuesta de valor de Lumina Lab */}
      <main>
        <section className="hero">
          <span className="hero-badge">Taller de Diseño 3D en Colombia</span>
          <h1 className="hero-title">
            Diseño e iluminación <span>impresa en 3D</span>
          </h1>
          <p className="hero-tagline">{siteConfig.tagline}</p>
          <div className="hero-actions">
            <a
              href="#catalogo"
              className="btn-cta-primary"
            >
              Explorar Catálogo
            </a>
            <a
              href={siteConfig.social.whatsapp.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-cta-secondary"
            >
              Pedir por WhatsApp
            </a>
          </div>

          {/* Píldoras de valor y compromiso de calidad */}
          <div className="hero-value-pills" aria-label="Beneficios y garantía">
            <div className="value-pill">
              <span className="value-pill-icon">📦</span>
              <span className="value-pill-text">Envío asegurado</span>
            </div>
            <div className="value-pill">
              <span className="value-pill-icon">🌿</span>
              <span className="value-pill-text">Filamento ecológico PLA</span>
            </div>
            <div className="value-pill">
              <span className="value-pill-icon">💡</span>
              <span className="value-pill-text">Iluminación LED incluida</span>
            </div>
          </div>
        </section>

        {/* Sección de confianza y proceso artesanal 3D */}
        <section className="process-section" id="proceso" aria-labelledby="process-title">
          <div className="process-container">
            <div className="section-header">
              <span className="section-badge">Manufactura Consciente</span>
              <h2 id="process-title" className="section-title">Del diseño 3D a tu espacio</h2>
              <p className="section-subtitle">
                Combinamos algoritmos de diseño geométrico con manufactura aditiva y acabados artesanales para crear piezas luminosas únicas.
              </p>
            </div>

            <div className="process-grid">
              <div className="process-card">
                <div className="process-step-number">01</div>
                <div className="process-card-icon">🎨</div>
                <h3 className="process-card-title">Modelado Digital</h3>
                <p className="process-card-desc">
                  Geometría paramétrica calculada para dispersar la luz en ángulos suaves de 360°, optimizando la estética y la eficiencia luminosa.
                </p>
              </div>

              <div className="process-card">
                <div className="process-step-number">02</div>
                <div className="process-card-icon">🖨️</div>
                <h3 className="process-card-title">Impresión 3D Capa por Capa</h3>
                <p className="process-card-desc">
                  Más de 16 horas de impresión aditiva continua de alta resolución utilizando filamento PLA 100% biodegradable de origen botánico.
                </p>
              </div>

              <div className="process-card">
                <div className="process-step-number">03</div>
                <div className="process-card-icon">⚡</div>
                <h3 className="process-card-title">Ensamblado y Prueba de Luz</h3>
                <p className="process-card-desc">
                  Montaje minucioso del socket y cableado, pulido manual y prueba de emisión térmica con bombillas LED cálidas de bajo consumo.
                </p>
              </div>

              <div className="process-card">
                <div className="process-step-number">04</div>
                <div className="process-card-icon">🚀</div>
                <h3 className="process-card-title">Entrega Asegurada a tu Puerta</h3>
                <p className="process-card-desc">
                  Empaque acolchado con materiales reciclables y envíos cotizados con Envíoclick a cualquier rincón de Colombia con garantía de reposición.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Catálogo interactivo de lámparas 3D (REC-1 / Unidad 003) */}
        <ProductGrid />

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

      {/* Footer editorial y de confianza */}
      <footer className="site-footer" role="contentinfo">
        <div className="footer-container">
          <div className="footer-brand-col">
            <div className="footer-brand-header">
              <div className="brand-icon">L</div>
              <span className="brand-name">{siteConfig.name}</span>
            </div>
            <p className="footer-brand-desc">
              Taller de diseño y manufactura aditiva 3D en Colombia. Creando iluminación contemporánea, cálida y consciente para el hogar.
            </p>
            <div className="footer-social-links">
              <a
                href={siteConfig.social.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-link"
              >
                Instagram {siteConfig.social.instagram.handle || '@luminalab_co'} (@luminalab_co)
              </a>
              <a
                href={siteConfig.social.whatsapp.url}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-link"
              >
                WhatsApp de Atención
              </a>
            </div>
          </div>

          <div className="footer-links-col">
            <h4 className="footer-col-title">Compromiso Lumina</h4>
            <ul className="footer-links-list">
              <li>🌱 Filamento PLA ecológico biodegradable</li>
              <li>💡 Bombillas LED de bajo consumo incluidas</li>
              <li>📦 Envíos asegurados a toda Colombia</li>
              <li>⚡ Fabricación artesanal bajo demanda</li>
            </ul>
          </div>

          <div className="footer-links-col">
            <h4 className="footer-col-title">Atención & Pedidos</h4>
            <p className="footer-help-text">
              ¿Deseas una personalización o color especial para tu espacio? Escríbenos directamente y la creamos para ti.
            </p>
            <a
              href={siteConfig.social.whatsapp.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-footer-whatsapp"
            >
              Contactar por WhatsApp
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Lumina Lab Colombia. Todos los derechos reservados.</p>
          <p className="footer-designer-tag">Estudio de Diseño Nórdico y Fabricación 3D</p>
        </div>
      </footer>

      {/* Panel lateral deslizable del carrito (REC-2 / Unidad 004) */}
      <CartDrawer />

      {/* Modal de checkout, pasarela y pedidos por WhatsApp (Unidad 005) */}
      <CheckoutModal />
    </div>
  );
}

function App() {
  return (
    <CartProvider>
      <MainApp />
    </CartProvider>
  );
}

export default App;
