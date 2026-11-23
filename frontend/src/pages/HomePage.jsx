import React, { useState, useEffect } from 'react';
import { siteConfig } from '../config/site.js';
import { products as officialProducts } from '../data/luminaProducts.js';
import ProductCard from '../components/ProductCard.jsx';
import ProductDetailModal from '../components/ProductDetailModal.jsx';

export default function HomePage({ onNavigate }) {
  const [activeDetailProduct, setActiveDetailProduct] = useState(null);

  // Seleccionar 3 productos destacados de la colección Leora para el preview de la Home
  const [featuredProducts, setFeaturedProducts] = useState(() =>
    officialProducts.filter((p) => p.collection === 'leora').slice(0, 3)
  );

  useEffect(() => {
    let isMounted = true;
    const envUrl = import.meta.env.VITE_API_URL;
    const baseUrl = envUrl ? envUrl.replace(/\/+$/, '') : '';
    fetch(`${baseUrl}/api/products/`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          const normalized = data.map((item) => ({
            ...item,
            inStock: item.in_stock !== undefined ? Boolean(item.in_stock) : Boolean(item.inStock),
            image: item.image_url || (item.images && item.images[0]) || item.image || '',
          }));
          const leoraItems = normalized.filter((p) => p.collection === 'leora').slice(0, 3);
          setFeaturedProducts(leoraItems.length > 0 ? leoraItems : normalized.slice(0, 3));
        }
      })
      .catch((err) => {
        console.warn('API /api/products/ no disponible para Home, usando respaldo local:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="home-page">
      {/* Hero Section Editorial (Tom Dixon / Houseof / Astro Lighting) */}
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
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('/products')}
                className="px-8 py-4 bg-[#121212] hover:bg-[#2A2A2A] text-white text-[12px] font-mono-tech uppercase tracking-[0.2em] transition-smooth inline-flex items-center gap-3 shadow-md"
              >
                Explorar Catálogo
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                </svg>
              </button>
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

            {/* Micro specs arquitectónicos */}
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
                <span className="text-[10px] font-mono-tech uppercase tracking-[0.25em] text-[#666]">COLECCIÓN LEORA • N° 01</span>
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
                  <h4 className="font-serif-title text-lg text-[#121212]">O1 Gravity Sculpted Lamp</h4>
                  <p className="text-[11px] font-mono-tech text-[#666]">Luz Ambiental Cálida • Biopolímero PLA</p>
                </div>
                <span className="font-mono-tech font-medium text-sm text-[#121212]">$455.000 COP</span>
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

      {/* Preview de Colección Destacada */}
      <section className="py-20 px-6 max-w-7xl mx-auto border-b border-[#E8E6E1]" id="destacados">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-6 border-b border-[#E8E6E1] gap-6">
          <div className="space-y-2">
            <span className="text-[11px] font-mono-tech uppercase tracking-[0.25em] text-[#888]">
              EDICIONES SELECCIONADAS
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif-title font-normal text-[#121212]">
              Lámparas Esculpidas Leora
            </h2>
            <p className="text-xs sm:text-sm text-[#666] font-light max-w-lg">
              Piezas icónicas inspiradas en fuerzas naturales, diseñadas para transformar la atmósfera de tus espacios.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate && onNavigate('/products')}
            className="px-6 py-3 border border-[#121212] bg-[#121212] text-white hover:bg-black text-[11px] font-mono-tech tracking-[0.2em] uppercase transition-all"
          >
            Ver Todo el Catálogo →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id || product.slug}
              product={product}
              onSelectDetail={(prod) => setActiveDetailProduct(prod)}
            />
          ))}
        </div>
      </section>

      {/* Sección Oscura Editorial: Filosofía del Atelier 3D */}
      <section id="filosofia" className="bg-[#121212] text-white py-24 px-6">
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

      {activeDetailProduct && (
        <ProductDetailModal
          product={activeDetailProduct}
          onClose={() => setActiveDetailProduct(null)}
        />
      )}
    </div>
  );
}
