import { useEffect, useState } from 'react';
import { siteConfig } from './config/site.js';
import ProductGrid from './components/ProductGrid.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import CheckoutModal from './components/CheckoutModal.jsx';
import { CartProvider, useCart } from './context/CartContext.jsx';

function NavbarContent() {
  const { totalItems, setIsCartOpen } = useCart();

  return (
    <>
      {/* Top Announcement Bar (Tom Dixon style) */}
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

      {/* Header / Navigation (Astro Lighting / Tom Dixon Minimalist) */}
      <header className="sticky top-0 z-40 bg-[#FAF9F7]/95 backdrop-blur-md border-b border-[#E8E6E1]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Left Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-[12px] font-mono-tech tracking-[0.18em] uppercase text-[#4A4A4A]">
            <a href="#catalogo" className="hover:text-black transition-colors font-medium">Colección</a>
            <a href="#proceso" className="hover:text-black transition-colors">Atelier 3D</a>
            <a href="#filosofia" className="hover:text-black transition-colors">Materiales</a>
            <a href={siteConfig.social.whatsapp.url} target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors">Bespoke</a>
          </nav>

          {/* Center Logo */}
          <div className="flex flex-col items-center">
            <a href="/" className="text-2xl font-serif-title tracking-[0.25em] font-medium text-[#121212]">
              {siteConfig.name.toUpperCase()}
            </a>
            <span className="text-[9px] font-mono-tech tracking-[0.35em] text-[#888884] uppercase -mt-0.5">
              STUDIO • 3D LIGHTING
            </span>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-5 sm:gap-6">
            <a
              href={siteConfig.social.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono-tech uppercase tracking-wider text-[#666] hover:text-black transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <span>Instagram</span>
            </a>

            <a
              href={siteConfig.social.whatsapp.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-block text-[11px] font-mono-tech uppercase tracking-wider text-[#666] hover:text-black transition-colors"
            >
              WhatsApp
            </a>
            
            <button
              id="cartBtn"
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2.5 px-4 py-2 border border-[#121212] bg-[#121212] text-white hover:bg-black text-[11px] font-mono-tech tracking-[0.18em] uppercase transition-all shadow-sm"
              aria-label="Abrir bolsa de compra"
            >
              <span>Bolsa</span>
              <span className="w-4 h-4 rounded-full bg-white text-[#121212] flex items-center justify-center font-bold text-[10px]">
                {totalItems}
              </span>
            </button>
          </div>

        </div>
      </header>
    </>
  );
}

function MainApp() {
  const [healthStatus, setHealthStatus] = useState('Conectando...');
  const [errorDetails, setErrorDetails] = useState(null);
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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
      {/* Top Bar y Navbar flotante */}
      <NavbarContent />

      <main className="flex-1">
        {/* Hero Section Editorial (Tom Dixon / Houseof / Astro) */}
        <section className="relative border-b border-[#E8E6E1] overflow-hidden bg-gradient-to-b from-[#FAF9F7] via-[#F4F2ED] to-[#EFECE6]">
          <div className="max-w-7xl mx-auto px-6 py-16 sm:py-24 lg:py-28 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Typography & Concept */}
            <div className="lg:col-span-7 space-y-8">
              <div className="inline-flex items-center gap-2.5 px-3 py-1 bg-white border border-[#E0DED7] text-[10px] font-mono-tech uppercase tracking-[0.22em] text-[#555]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E58A4E]"></span>
                <span className="hero-badge font-semibold text-[#121212]">Taller de Diseño 3D en Colombia</span>
                <span className="opacity-40">•</span>
                <span>COLECCIÓN ESCULTURAL</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif-title font-normal leading-[1.12] text-[#111111]">
                Esculturas de luz <br />
                <span className="italic font-light text-[#3A3835]">impresas en 3D.</span>
              </h1>

              <p className="text-base sm:text-lg text-[#55524E] max-w-xl font-light leading-relaxed">
                Diseño contemporáneo que desafía las formas tradicionales. Piezas arquitectónicas fabricadas capa por capa en nuestro atelier de Bogotá con biopolímeros ecológicos y tecnología LED de luz cálida.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  href="#catalogo"
                  className="px-8 py-4 bg-[#121212] hover:bg-[#2A2A2A] text-white text-[12px] font-mono-tech uppercase tracking-[0.2em] transition-smooth inline-flex items-center gap-3 shadow-md"
                >
                  Explorar Catálogo
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                  </svg>
                </a>
                <a
                  href={siteConfig.social.whatsapp.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-7 py-4 bg-transparent hover:bg-black/5 border border-[#121212] text-[#121212] text-[12px] font-mono-tech uppercase tracking-[0.2em] transition-smooth"
                >
                  Asesoría WhatsApp
                </a>
              </div>

              {/* Píldoras de valor requeridas */}
              <div className="pt-4 flex flex-wrap items-center gap-3 text-xs font-mono-tech uppercase tracking-wider text-[#555]">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-[#E8E6E1] rounded-sm">
                  <span>📦</span>
                  <span>Envío asegurado</span>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-[#E8E6E1] rounded-sm">
                  <span>🌿</span>
                  <span>Filamento ecológico PLA</span>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-[#E8E6E1] rounded-sm">
                  <span>💡</span>
                  <span>Iluminación LED incluida</span>
                </div>
              </div>

              {/* Micro stats / specs arquitectónicos */}
              <div className="pt-6 grid grid-cols-3 gap-6 border-t border-[#E2DFD7] text-left">
                <div>
                  <span className="block text-xl font-mono-tech font-medium text-[#121212]">100%</span>
                  <span className="text-[11px] font-mono-tech tracking-wider uppercase text-[#777]">Biopolímero PLA</span>
                </div>
                <div>
                  <span className="block text-xl font-mono-tech font-medium text-[#121212]">2700K</span>
                  <span className="text-[11px] font-mono-tech tracking-wider uppercase text-[#777]">Luz Cálida Zen</span>
                </div>
                <div>
                  <span className="block text-xl font-mono-tech font-medium text-[#121212]">0.16mm</span>
                  <span className="text-[11px] font-mono-tech tracking-wider uppercase text-[#777]">Resolución de Capa</span>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Lamp Showcase with Glow */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="absolute inset-0 bg-[#F5C28C]/20 blur-[80px] rounded-full transform scale-90 pointer-events-none"></div>

              <div className="relative w-full max-w-md aspect-[4/5] bg-gradient-to-b from-[#F2EFE9] to-[#E5E0D5] border border-black/10 rounded-sm p-8 flex flex-col justify-between overflow-hidden shadow-2xl">
                <div className="flex justify-between items-start z-10">
                  <span className="text-[10px] font-mono-tech uppercase tracking-[0.25em] text-[#666]">SERIE VORONOI • N° 01</span>
                  <span className="px-2 py-0.5 bg-black text-white text-[9px] font-mono-tech tracking-widest uppercase">DISPONIBLE</span>
                </div>

                <div className="my-auto flex justify-center items-center relative py-6">
                  <div className="absolute w-28 h-28 rounded-full bg-[#FFB86A] blur-xl opacity-75 animate-pulse"></div>
                  
                  <svg className="w-64 h-64 relative z-10 glow-lamp transition-transform duration-700 hover:scale-105" viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="75" y="215" width="50" height="8" rx="2" fill="#2B2824"/>
                    <line x1="100" y1="210" x2="100" y2="215" stroke="#444" strokeWidth="3"/>
                    <ellipse cx="100" cy="130" rx="60" ry="75" fill="url(#lampGrad)" stroke="#1A1816" strokeWidth="1.2"/>
                    <path d="M45 110 C 65 118, 135 118, 155 110" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5"/>
                    <path d="M42 125 C 65 135, 135 135, 158 125" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"/>
                    <path d="M43 140 C 65 150, 135 150, 157 140" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5"/>
                    <path d="M48 155 C 68 165, 132 165, 152 155" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
                    <path d="M58 170 C 75 178, 125 178, 142 170" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
                    <ellipse cx="100" cy="58" rx="28" ry="10" fill="#FFE2B8" stroke="#1A1816" strokeWidth="1.5"/>
                    <circle cx="100" cy="58" r="14" fill="#FFA94D" filter="blur(2px)"/>
                    <defs>
                      <linearGradient id="lampGrad" x1="100" y1="55" x2="100" y2="205" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#FFEED6"/>
                        <stop offset="0.3" stopColor="#FCD5A3"/>
                        <stop offset="0.7" stopColor="#EAA663"/>
                        <stop offset="1" stopColor="#C27A3A"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                <div className="flex justify-between items-end border-t border-black/10 pt-4 z-10">
                  <div>
                    <h4 className="font-serif-title text-lg text-[#121212]">Lámpara Duna Escultural</h4>
                    <p className="text-[11px] font-mono-tech text-[#666]">Luz Ambiental Cálida • E27 LED</p>
                  </div>
                  <span className="font-mono-tech font-medium text-sm text-[#121212]">$155.000 COP</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Brand Architectural Pillars (Astro Lighting Minimal Grid) */}
        <section className="border-b border-[#E8E6E1] bg-white">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#E8E6E1]">
            <div className="p-8 space-y-2">
              <span className="text-[11px] font-mono-tech tracking-[0.2em] text-[#888] uppercase">01 / ARQUITECTURA</span>
              <h3 className="font-serif-title text-base font-medium">Geometría Paramétrica</h3>
              <p className="text-xs text-[#666] font-light leading-relaxed">
                Diseños computacionales complejos que difunden la luz en patrones orgánicos imposibles en cerámica tradicional.
              </p>
            </div>
            <div className="p-8 space-y-2">
              <span className="text-[11px] font-mono-tech tracking-[0.2em] text-[#888] uppercase">02 / SOSTENIBILIDAD</span>
              <h3 className="font-serif-title text-base font-medium">Biopolímero PLA Puro</h3>
              <p className="text-xs text-[#666] font-light leading-relaxed">
                Filamentos biodegradables derivados de recursos botánicos renovables (almidón de maíz), libres de toxinas y de tacto mate.
              </p>
            </div>
            <div className="p-8 space-y-2">
              <span className="text-[11px] font-mono-tech tracking-[0.2em] text-[#888] uppercase">03 / CONEXIÓN</span>
              <h3 className="font-serif-title text-base font-medium">Iluminación LED Certificada</h3>
              <p className="text-xs text-[#666] font-light leading-relaxed">
                Cada lámpara incluye bombillo LED cálido de alta eficiencia, con socket universal y cable textil de seguridad.
              </p>
            </div>
            <div className="p-8 space-y-2">
              <span className="text-[11px] font-mono-tech tracking-[0.2em] text-[#888] uppercase">04 / CONCIERGE</span>
              <h3 className="font-serif-title text-base font-medium">Despacho y WhatsApp</h3>
              <p className="text-xs text-[#666] font-light leading-relaxed">
                Empaque acolchado protector, cálculo de tarifas con Envíoclick y acompañamiento personalizado directo.
              </p>
            </div>
          </div>
        </section>

        {/* Sección de Confianza y Proceso: Del diseño 3D a tu espacio */}
        <section className="py-20 px-6 border-b border-[#E8E6E1] bg-[#FAF9F7]" id="proceso">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="max-w-2xl space-y-3">
              <span className="text-[11px] font-mono-tech uppercase tracking-[0.25em] text-[#888]">
                PROCESO DE MANUFACTURA CONSCIENTE
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif-title font-normal text-[#121212]">
                Del diseño 3D a tu espacio
              </h2>
              <p className="text-sm text-[#666] font-light leading-relaxed">
                Combinamos algoritmos de diseño geométrico con manufactura aditiva y acabados artesanales para dar vida a piezas de iluminación de autor.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white border border-[#E8E6E1] p-6 space-y-3 rounded-sm shadow-sm">
                <span className="text-[12px] font-mono-tech text-[#E58A4E] font-semibold tracking-wider">PASO 01</span>
                <h3 className="font-serif-title text-lg font-medium text-[#121212]">Modelado Digital</h3>
                <p className="text-xs text-[#666] font-light leading-relaxed">
                  Geometría paramétrica calculada para dispersar la luz en ángulos suaves de 360°, optimizando la estética y la dispersión luminosa.
                </p>
              </div>

              <div className="bg-white border border-[#E8E6E1] p-6 space-y-3 rounded-sm shadow-sm">
                <span className="text-[12px] font-mono-tech text-[#E58A4E] font-semibold tracking-wider">PASO 02</span>
                <h3 className="font-serif-title text-lg font-medium text-[#121212]">Impresión 3D</h3>
                <p className="text-xs text-[#666] font-light leading-relaxed">
                  Más de 16 horas de manufactura aditiva continua capa por capa con filamento PLA ecológico de alta definición botánica.
                </p>
              </div>

              <div className="bg-white border border-[#E8E6E1] p-6 space-y-3 rounded-sm shadow-sm">
                <span className="text-[12px] font-mono-tech text-[#E58A4E] font-semibold tracking-wider">PASO 03</span>
                <h3 className="font-serif-title text-lg font-medium text-[#121212]">Ensamblado y Prueba de Luz</h3>
                <p className="text-xs text-[#666] font-light leading-relaxed">
                  Montaje eléctrico minucioso con socket certificado, pulido manual y prueba de emisión térmica con bombillas LED cálidas.
                </p>
              </div>

              <div className="bg-white border border-[#E8E6E1] p-6 space-y-3 rounded-sm shadow-sm">
                <span className="text-[12px] font-mono-tech text-[#E58A4E] font-semibold tracking-wider">PASO 04</span>
                <h3 className="font-serif-title text-lg font-medium text-[#121212]">Entrega Asegurada a tu Puerta</h3>
                <p className="text-xs text-[#666] font-light leading-relaxed">
                  Empaque acolchado con materiales reciclables y envíos cotizados a toda Colombia con Envíoclick y reposición garantizada.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Catálogo de Productos (ProductGrid) */}
        <ProductGrid />

        {/* Sección Oscura Editorial: Filosofía del Atelier 3D (Tom Dixon style) */}
        <section id="filosofia" className="bg-[#121212] text-white py-24 px-6 border-y border-white/10">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-5 space-y-6">
              <span className="text-[11px] font-mono-tech uppercase tracking-[0.25em] text-[#A0A09C]">
                FILOSOFÍA DEL ATELIER
              </span>
              <h2 className="text-3xl sm:text-5xl font-serif-title font-normal leading-tight">
                La precisión digital se encuentra con la luz cálida.
              </h2>
              <p className="text-[#A5A5A0] font-light leading-relaxed text-sm sm:text-base">
                En lugar de recurrir a la producción masiva en serie, cada pieza de Lumina Lab se produce bajo demanda en nuestro taller. La impresión 3D nos permite esculpir ranuras micrométricas que modulan el haz luminoso, generando texturas que proyectan sombras suaves y acogedoras en tus paredes.
              </p>

              <div className="space-y-4 pt-4 border-t border-white/10">
                <div className="flex items-start gap-4">
                  <span className="text-xs font-mono-tech text-[#E8A868] mt-1">01.</span>
                  <div>
                    <h4 className="font-medium text-sm">Producción Cero Residuos</h4>
                    <p className="text-xs text-[#888] font-light">Solo consumimos el filamento exacto que compone la geometría de tu lámpara.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <span className="text-xs font-mono-tech text-[#E8A868] mt-1">02.</span>
                  <div>
                    <h4 className="font-medium text-sm">Control Eléctrico Seguro</h4>
                    <p className="text-xs text-[#888] font-light">Instalación probada contra calentamiento, sockets universales y switch de paso.</p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <a
                  href={siteConfig.social.instagram.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-mono-tech uppercase tracking-[0.2em] text-[#E8A868] hover:underline"
                >
                  Ver videos del proceso en {siteConfig.social.instagram.handle} →
                </a>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-2 gap-4">
              <div className="bg-[#1C1C1C] border border-white/10 aspect-square p-6 flex flex-col justify-between">
                <span className="text-[10px] font-mono-tech tracking-widest text-[#777]">DETALLE DE ESTRÍAS 3D</span>
                <div className="space-y-1.5 opacity-60">
                  <div className="h-0.5 w-full bg-white/20"></div>
                  <div className="h-0.5 w-full bg-white/30"></div>
                  <div className="h-0.5 w-full bg-white/40"></div>
                  <div className="h-0.5 w-full bg-white/50"></div>
                  <div className="h-0.5 w-full bg-white/60"></div>
                  <div className="h-0.5 w-full bg-white/80"></div>
                </div>
                <span className="text-xs font-serif-title italic text-[#CCC]">Difusión lumínica sin deslumbramiento</span>
              </div>

              <div className="bg-[#242220] border border-white/10 aspect-square p-6 flex flex-col justify-between">
                <span className="text-[10px] font-mono-tech tracking-widest text-[#E8A868]">ORIGEN BIOLÓGICO</span>
                <div className="flex justify-center items-center my-auto">
                  <span className="text-4xl">🌿</span>
                </div>
                <span className="text-xs font-serif-title text-[#EEE]">Polímero de maíz 100% biodegradable</span>
              </div>
            </div>
          </div>
        </section>

        {/* Sección de estado del servicio backend */}
        <section className="py-8 px-6 bg-[#FAF9F7] border-b border-[#E8E6E1]">
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

      {/* Footer Estructurado y Editorial (Astro Lighting / Tom Dixon) */}
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
            <h4 className="text-[11px] font-mono-tech tracking-[0.2em] uppercase text-[#AAA]">COLECCIÓN</h4>
            <ul className="text-xs space-y-2 text-[#777] font-light">
              <li><a href="#catalogo" className="hover:text-white transition-colors">Lámparas de Mesa</a></li>
              <li><a href="#catalogo" className="hover:text-white transition-colors">Esculturas de Luz</a></li>
              <li><a href="#catalogo" className="hover:text-white transition-colors">Ediciones 2026</a></li>
              <li><a href={siteConfig.social.whatsapp.url} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Proyectos a Medida</a></li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-3">
            <h4 className="text-[11px] font-mono-tech tracking-[0.2em] uppercase text-[#AAA]">COMPROMISO LUMINA</h4>
            <ul className="text-xs space-y-2 text-[#777] font-light">
              <li>🌱 Filamento PLA ecológico biodegradable</li>
              <li>💡 Bombillas LED de bajo consumo incluidas</li>
              <li>📦 Envíos asegurados a toda Colombia</li>
              <li>⚡ Fabricación artesanal bajo demanda</li>
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
          <span>Estudio de Diseño Nórdico y Fabricación 3D</span>
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
