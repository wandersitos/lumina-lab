import React, { useEffect, useState } from 'react';
import { siteConfig } from './config/site.js';
import CartDrawer from './components/CartDrawer.jsx';
import CheckoutModal from './components/CheckoutModal.jsx';
import { CartProvider, useCart } from './context/CartContext.jsx';
import HomePage from './pages/HomePage.jsx';
import ProductsPage from './pages/ProductsPage.jsx';
import ProductDetailPage from './pages/ProductDetailPage.jsx';

function NavbarContent({ currentView, onNavigate }) {
  const { totalItems, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLinkClick = (e, path) => {
    setMobileMenuOpen(false);
    if (e.button === 0 && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) {
      e.preventDefault();
      onNavigate(path);
    }
  };

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-[#121212] text-white text-[11px] font-mono-tech tracking-[0.2em] py-2 px-4 text-center uppercase border-b border-white/10 flex flex-wrap justify-center items-center gap-2 sm:gap-3">
        <span>LUMINA LAB • EDICIONES 3D LIMITADAS</span>
        <span className="opacity-40 hidden sm:inline">•</span>
        <span className="hidden sm:inline">ENVÍO SIN COSTO EN COLOMBIA POR COMPRAS SUPERIORES A $180.000</span>
        <span className="opacity-40">•</span>
        <a
          href={siteConfig.social.instagram.url}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-[#E8A868] transition-colors"
        >
          {siteConfig.social.instagram.handle.toUpperCase()}
        </a>
      </div>

      {/* Header / Navigation Totalmente Responsivo */}
      <header className="sticky top-0 z-40 bg-[#FAF9F7]/95 backdrop-blur-md border-b border-[#E8E6E1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          
          {/* Botón Menú Móvil (Hamburger) en pantallas pequeñas */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 -ml-2 text-[#121212] hover:text-black focus:outline-none"
              aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú de navegación'}
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Navegación Principal Escritorio: Inicio y Productos con tags <a> nativos */}
          <nav className="hidden md:flex items-center gap-6 sm:gap-8 text-[12px] font-mono-tech tracking-[0.18em] uppercase main-nav">
            <a
              href="/"
              onClick={(e) => handleLinkClick(e, '/')}
              className={`transition-colors py-2 border-b-2 ${
                currentView === 'home'
                  ? 'border-black text-black font-semibold'
                  : 'border-transparent text-[#666] hover:text-black font-medium'
              }`}
            >
              Inicio
            </a>
            <a
              href="/products"
              onClick={(e) => handleLinkClick(e, '/products')}
              className={`transition-colors py-2 border-b-2 ${
                currentView === 'products'
                  ? 'border-black text-black font-semibold'
                  : 'border-transparent text-[#666] hover:text-black font-medium'
              }`}
            >
              Productos
            </a>
          </nav>

          {/* Logo Central (sin colisión en mobile) */}
          <a
            href="/"
            onClick={(e) => handleLinkClick(e, '/')}
            className="flex flex-col items-center cursor-pointer text-center"
          >
            <span className="text-lg sm:text-2xl font-serif-title tracking-[0.25em] font-medium text-[#121212]">
              {siteConfig.name.toUpperCase()}
            </span>
            <span className="text-[8px] sm:text-[9px] font-mono-tech tracking-[0.35em] text-[#888884] uppercase -mt-0.5">
              STUDIO • 3D LIGHTING
            </span>
          </a>

          {/* Acciones Derecha: Instagram y Bolsa */}
          <div className="flex items-center gap-3 sm:gap-6">
            <a
              href={siteConfig.social.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-1.5 text-[11px] font-mono-tech uppercase tracking-wider text-[#666] hover:text-black transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <span>Instagram</span>
            </a>
            
            <button
              id="cartBtn"
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 border border-[#121212] bg-[#121212] text-white hover:bg-black text-[10px] sm:text-[11px] font-mono-tech tracking-[0.18em] uppercase transition-all shadow-sm"
              aria-label="Abrir bolsa de compra"
            >
              <span>Bolsa</span>
              <span className="w-4 h-4 rounded-full bg-white text-[#121212] flex items-center justify-center font-bold text-[10px]">
                {totalItems}
              </span>
            </button>
          </div>

        </div>

        {/* Desplegable de Navegación Móvil */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#FAF9F7] border-t border-[#E8E6E1] px-6 py-4 space-y-3 font-mono-tech text-xs uppercase tracking-[0.2em] shadow-lg">
            <a
              href="/"
              onClick={(e) => handleLinkClick(e, '/')}
              className={`block py-2.5 border-b border-[#E8E6E1]/60 ${
                currentView === 'home' ? 'font-bold text-black' : 'text-[#555]'
              }`}
            >
              Inicio
            </a>
            <a
              href="/products"
              onClick={(e) => handleLinkClick(e, '/products')}
              className={`block py-2.5 border-b border-[#E8E6E1]/60 ${
                currentView === 'products' ? 'font-bold text-black' : 'text-[#555]'
              }`}
            >
              Productos
            </a>
            <a
              href={siteConfig.social.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block py-2.5 text-[#555] hover:text-black border-b border-[#E8E6E1]/60"
            >
              Instagram @luminalab_co
            </a>
            <a
              href={siteConfig.social.whatsapp.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block py-2.5 text-[#25D366] font-semibold"
            >
              Asesoría por WhatsApp
            </a>
          </div>
        )}
      </header>
    </>
  );
}

function parseCurrentRoute() {
  if (typeof window === 'undefined') {
    return { view: 'home', slug: null };
  }
  const path = window.location.pathname;
  const search = window.location.search;

  // Ruta detalle de producto: /product/:slug o /producto/:slug o /products/:slug (cuando slug no está vacío)
  const productMatch = path.match(/^\/(?:product|producto|products)\/([a-zA-Z0-9_-]+)\/?$/);
  if (productMatch && productMatch[1]) {
    return { view: 'product-detail', slug: productMatch[1] };
  }

  if (path === '/products' || path === '/products/' || search.includes('view=products')) {
    return { view: 'products', slug: null };
  }

  return { view: 'home', slug: null };
}

function MainApp() {
  const [route, setRoute] = useState(parseCurrentRoute);
  const [healthStatus, setHealthStatus] = useState('Conectando...');
  const [errorDetails, setErrorDetails] = useState(null);
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  // Manejo de historial del navegador (popstate)
  useEffect(() => {
    const handlePopState = () => {
      setRoute(parseCurrentRoute());
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Navegación entre vistas
  const handleNavigate = (targetPath) => {
    if (!targetPath) return;

    const productMatch = targetPath.match(/^\/(?:product|producto|products)\/([a-zA-Z0-9_-]+)\/?$/);
    if (productMatch && productMatch[1]) {
      setRoute({ view: 'product-detail', slug: productMatch[1] });
      window.history.pushState(null, '', `/product/${productMatch[1]}`);
    } else if (targetPath === '/products' || targetPath === 'products') {
      setRoute({ view: 'products', slug: null });
      window.history.pushState(null, '', '/products');
    } else {
      setRoute({ view: 'home', slug: null });
      window.history.pushState(null, '', '/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    fetch(`${apiUrl}/api/health/`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
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
    <div className="min-h-screen flex flex-col bg-[#FAF9F7] text-[#121212]">
      {/* Header con Navbar responsiva Inicio y Productos */}
      <NavbarContent currentView={route.view} onNavigate={handleNavigate} />

      {/* Contenido Principal según la ruta activa */}
      <main className="flex-1">
        {route.view === 'product-detail' ? (
          <ProductDetailPage slug={route.slug} onNavigate={handleNavigate} />
        ) : route.view === 'products' ? (
          <ProductsPage onNavigate={handleNavigate} />
        ) : (
          <HomePage onNavigate={handleNavigate} />
        )}

        {/* Sección de estado del servicio backend */}
        <section className="py-6 px-6 bg-[#FAF9F7] border-t border-[#E8E6E1]">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs font-mono-tech text-[#666] gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>API Backend: <strong>{healthStatus}</strong></span>
              {errorDetails && <span className="text-red-500">({errorDetails})</span>}
            </div>
            <span>Monitoreo en tiempo real • Django Core</span>
          </div>
        </section>
      </main>

      {/* Footer Estructurado y Editorial */}
      <footer className="site-footer bg-[#121212] text-white pt-16 pb-12 px-6 border-t border-white/10" role="contentinfo">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-white/10">
          <div className="md:col-span-4 space-y-4">
            <h3 className="font-serif-title text-2xl tracking-[0.2em] font-medium text-white">
              {siteConfig.name.toUpperCase()}
            </h3>
            <p className="text-xs text-[#888] font-light max-w-sm leading-relaxed">
              Atelier de iluminación y decoración 3D contemporánea. Fabricación aditiva de alta precisión bajo demanda en Colombia.
            </p>
            <span className="text-[11px] font-mono-tech text-[#AAA] block">Bogotá D.C., Colombia</span>
          </div>

          <div className="md:col-span-2 space-y-3">
            <h4 className="text-[11px] font-mono-tech tracking-[0.2em] uppercase text-[#AAA]">NAVEGACIÓN</h4>
            <ul className="text-xs space-y-2 text-[#777] font-light">
              <li>
                <a
                  href="/"
                  onClick={(e) => {
                    if (e.button === 0 && !e.ctrlKey && !e.metaKey) {
                      e.preventDefault();
                      handleNavigate('/');
                    }
                  }}
                  className="hover:text-white transition-colors"
                >
                  Inicio
                </a>
              </li>
              <li>
                <a
                  href="/products"
                  onClick={(e) => {
                    if (e.button === 0 && !e.ctrlKey && !e.metaKey) {
                      e.preventDefault();
                      handleNavigate('/products');
                    }
                  }}
                  className="hover:text-white transition-colors"
                >
                  Productos
                </a>
              </li>
              <li>
                <a href={siteConfig.social.whatsapp.url} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  Proyectos a Medida
                </a>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-3">
            <h4 className="text-[11px] font-mono-tech tracking-[0.2em] uppercase text-[#AAA]">COMPROMISO LUMINA</h4>
            <ul className="text-xs space-y-2 text-[#777] font-light">
              <li>🌱 Filamento ecológico PLA biodegradable</li>
              <li>💡 Iluminación LED incluida de bajo consumo</li>
              <li>📦 Envío asegurado a toda Colombia</li>
              <li>⚡ Taller de Diseño 3D en Colombia</li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-4">
            <h4 className="text-[11px] font-mono-tech tracking-[0.2em] uppercase text-[#AAA]">CANAL DIRECTO</h4>
            <p className="text-xs text-[#888] font-light">
              Síguenos en Instagram para ver nuevos lanzamientos y pruebas de filamentos en el taller.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={siteConfig.social.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 border border-white/20 text-[11px] font-mono-tech tracking-wider uppercase hover:border-white transition-colors"
              >
                {siteConfig.social.instagram.handle || '@luminalab_co'}
              </a>
              <a
                href={siteConfig.social.whatsapp.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-white text-[#121212] text-[11px] font-mono-tech tracking-wider uppercase hover:bg-neutral-200 transition-colors"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row justify-between items-center text-[11px] font-mono-tech text-[#666] tracking-wider uppercase gap-4">
          <span>&copy; {new Date().getFullYear()} Lumina Lab Colombia. Todos los derechos reservados.</span>
          <span>Del diseño 3D a tu espacio • Modelado Digital • Impresión 3D • Ensamblado y Prueba de Luz • Entrega Asegurada a tu Puerta</span>
        </div>
      </footer>

      {/* Slide-over Carrito */}
      <CartDrawer />

      {/* Checkout Modal */}
      <CheckoutModal />
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <MainApp />
    </CartProvider>
  );
}
