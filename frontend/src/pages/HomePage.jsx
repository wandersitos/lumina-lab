import React, { useState, useEffect } from 'react';
import { siteConfig } from '../config/site.js';
import { products as officialProducts } from '../data/luminaProducts.js';
import ProductCard from '../components/ProductCard.jsx';
import ProductDetailModal from '../components/ProductDetailModal.jsx';

const HERO_GALLERY = [
  {
    src: 'https://res.cloudinary.com/dja3bhm9j/image/upload/v1795490346/Leora-Floral-May-2025_4_ue6skw.jpg',
    alt: 'Lámpara escultórica Lumina Lab — vista frontal',
  },
  {
    src: 'https://res.cloudinary.com/dja3bhm9j/image/upload/v1795490346/Leora-Floral-May-2025_14_sx1wrx.jpg',
    alt: 'Lámpara escultórica Lumina Lab — detalle de textura y luz',
  },
  {
    src: 'https://res.cloudinary.com/dja3bhm9j/image/upload/v1795490346/Leora-Floral-May-2025_41_fd1yxk.jpg',
    alt: 'Lámpara escultórica Lumina Lab — ambiente contemporáneo',
  },
];

const O4_FLOW_IMG =
  'https://res.cloudinary.com/dja3bhm9j/image/upload/v1774209565/lumina-lab/Leora/O4%20Flow%20Sculpted%20Lamp/Photos/01.jpg';
const O15_MINI_IMG =
  'https://res.cloudinary.com/dja3bhm9j/image/upload/v1774209553/lumina-lab/Leora/O15-s%20Biomorphic/O15-s-V2-02.jpg';
const O2_LANDSCAPE_IMG =
  'https://res.cloudinary.com/dja3bhm9j/image/upload/v1774209559/lumina-lab/Leora/O2%20Landscape%20Sculpted%20Lamp/Photos/03.jpg';

export default function HomePage({ onNavigate }) {
  const [activeDetailProduct, setActiveDetailProduct] = useState(null);

  const [featuredProducts, setFeaturedProducts] = useState(() =>
    officialProducts.filter((p) => p.collection === 'leora').slice(0, 4)
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
          const leoraItems = normalized.filter((p) => p.collection === 'leora').slice(0, 4);
          setFeaturedProducts(leoraItems.length > 0 ? leoraItems : normalized.slice(0, 4));
        }
      })
      .catch((err) => {
        console.warn('API /api/products/ no disponible para Home, usando respaldo local:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleNavClick = (e, path) => {
    if (e.button === 0 && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) {
      e.preventDefault();
      onNavigate && onNavigate(path);
    }
  };

  return (
    <div className="home-page">
      {/* 1. Hero Editorial con Galería en Grid de 3 Fotos */}
      <section className="relative border-b border-[#E8E6E1] bg-[#FAF9F7]">
        <div className="max-w-7xl mx-auto px-6 py-14 sm:py-20 lg:py-24 space-y-12">
          <div className="max-w-3xl space-y-6">
            <span className="inline-block text-[11px] font-mono-tech uppercase tracking-[0.28em] text-[#777]">
              ESTUDIO DE ILUMINACIÓN • MEDELLÍN, COLOMBIA
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif-title font-normal leading-[1.08] text-[#111111]">
              Iluminación contemporánea de formas escultóricas.
            </h1>
            <p className="text-base sm:text-lg text-[#55524E] max-w-2xl font-light leading-relaxed">
              Lámparas de mesa de líneas orgánicas diseñadas para transformar la atmósfera de hogares, estudios y proyectos con luz inalámbrica sin cables.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="/products"
                onClick={(e) => handleNavClick(e, '/products')}
                className="px-8 py-4 bg-[#121212] hover:bg-[#2A2A2A] text-white text-[12px] font-mono-tech uppercase tracking-[0.2em] transition-all inline-flex items-center gap-3"
              >
                Explorar Productos
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
              <a
                href={siteConfig.social.whatsapp.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-7 py-4 bg-transparent hover:bg-black/5 border border-[#121212] text-[#121212] text-[12px] font-mono-tech uppercase tracking-[0.2em] transition-all"
              >
                Asesoría Directa
              </a>
            </div>
          </div>

          {/* Grid de 3 Fotografías Editoriales */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {HERO_GALLERY.map((photo, index) => (
              <div
                key={photo.src}
                className="relative aspect-[4/5] overflow-hidden bg-[#EFECE6] border border-[#E8E6E1] group"
              >
                <img
                  src={photo.src}
                  alt={photo.alt}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Colección Destacada: Lámparas de Mesa */}
      <section className="py-20 px-6 max-w-7xl mx-auto border-b border-[#E8E6E1]" id="destacados">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-6 border-b border-[#E8E6E1] gap-6">
          <div className="space-y-2">
            <span className="text-[11px] font-mono-tech uppercase tracking-[0.25em] text-[#888]">
              COLECCIÓN DESTACADA
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif-title font-normal text-[#121212]">
              Lámparas de Mesa
            </h2>
            <p className="text-xs sm:text-sm text-[#666] font-light max-w-lg">
              Piezas icónicas pensadas para mesas auxiliares, escritorios y mesas de noche con iluminación ambiental suave.
            </p>
          </div>

          <a
            href="/products"
            onClick={(e) => handleNavClick(e, '/products')}
            className="px-6 py-3 border border-[#121212] bg-[#121212] text-white hover:bg-black text-[11px] font-mono-tech tracking-[0.2em] uppercase transition-all self-start md:self-auto"
          >
            Ver Todo el Catálogo →
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id || product.slug}
              product={product}
              onSelectDetail={(prod) => {
                if (onNavigate) {
                  onNavigate(`/product/${prod.slug}`);
                } else {
                  setActiveDetailProduct(prod);
                }
              }}
            />
          ))}
        </div>
      </section>

      {/* 3. Formatos: Dos escalas para cada espacio */}
      <section className="py-20 px-6 bg-white border-b border-[#E8E6E1]" id="formatos">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="max-w-2xl space-y-2">
            <span className="text-[11px] font-mono-tech uppercase tracking-[0.25em] text-[#888]">
              FORMATOS Y PROPORCIONES
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif-title font-normal text-[#121212]">
              Dos escalas para cada espacio
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <a
              href="/products"
              onClick={(e) => handleNavClick(e, '/products')}
              className="group block border border-[#E8E6E1] bg-[#FAF9F7] overflow-hidden"
            >
              <div className="aspect-[16/10] overflow-hidden bg-[#EFECE6]">
                <img
                  src={O4_FLOW_IMG}
                  alt="Línea Sculpted — O4 Flow"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
              </div>
              <div className="p-8 space-y-3">
                <span className="text-[11px] font-mono-tech uppercase tracking-[0.2em] text-[#888]">
                  PROTAGONISMO VISUAL
                </span>
                <h3 className="text-2xl font-serif-title text-[#121212]">Línea Sculpted</h3>
                <p className="text-sm text-[#666] font-light leading-relaxed">
                  Formato de presencia amplia para salas, consolas, aparadores y rincones principales. Referencia destacada: O4 Flow.
                </p>
                <span className="inline-block pt-2 text-[11px] font-mono-tech uppercase tracking-[0.2em] text-[#121212] underline">
                  Explorar Línea Sculpted →
                </span>
              </div>
            </a>

            <a
              href="/products"
              onClick={(e) => handleNavClick(e, '/products')}
              className="group block border border-[#E8E6E1] bg-[#FAF9F7] overflow-hidden"
            >
              <div className="aspect-[16/10] overflow-hidden bg-[#EFECE6]">
                <img
                  src={O15_MINI_IMG}
                  alt="Línea Mini — O15-S Biomorphic"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
              </div>
              <div className="p-8 space-y-3">
                <span className="text-[11px] font-mono-tech uppercase tracking-[0.2em] text-[#888]">
                  VERSATILIDAD COMPACTA
                </span>
                <h3 className="text-2xl font-serif-title text-[#121212]">Línea Mini</h3>
                <p className="text-sm text-[#666] font-light leading-relaxed">
                  Escala compacta ideal para mesas de noche, repisas, escritorios y nichos. Referencia destacada: O15-S Biomorphic.
                </p>
                <span className="inline-block pt-2 text-[11px] font-mono-tech uppercase tracking-[0.2em] text-[#121212] underline">
                  Explorar Línea Mini →
                </span>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* 4. Bloque Oscuro Editorial: Proyectos y asesoría */}
      <section id="proyectos" className="bg-[#121212] text-white py-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-[11px] font-mono-tech uppercase tracking-[0.25em] text-[#A0A09C]">
              PROYECTOS Y ASESORÍA
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif-title font-normal leading-tight">
              Iluminación para hogares, estudios y proyectos.
            </h2>
            <p className="text-[#A5A5A0] font-light leading-relaxed text-sm sm:text-base">
              Acompañamos a interioristas, arquitectos y clientes particulares en la selección de piezas, escalas y temperaturas de luz para espacios residenciales, hotelería y locales comerciales.
            </p>
            <div className="pt-4">
              <a
                href={siteConfig.social.whatsapp.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-7 py-4 bg-white text-[#121212] hover:bg-neutral-200 text-[12px] font-mono-tech uppercase tracking-[0.2em] transition-colors"
              >
                Consultar por WhatsApp →
              </a>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="aspect-[4/3] overflow-hidden border border-white/10 bg-[#1C1C1C]">
              <img
                src={O2_LANDSCAPE_IMG}
                alt="O2 Landscape — Iluminación para proyectos y espacios"
                className="w-full h-full object-cover object-center"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 5. Franja de 4 Pilares */}
      <section className="border-b border-[#E8E6E1] bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#E8E6E1]">
          <div className="p-8 space-y-2">
            <span className="text-[11px] font-mono-tech tracking-[0.2em] text-[#888] uppercase">01 / DISEÑO</span>
            <h3 className="font-serif-title text-base font-medium text-[#121212]">Piezas Escultóricas</h3>
            <p className="text-xs text-[#666] font-light leading-relaxed">
              Volúmenes orgánicos pensados para proyectar luz ambiental uniforme y aportar carácter arquitectónico incluso apagadas.
            </p>
          </div>
          <div className="p-8 space-y-2">
            <span className="text-[11px] font-mono-tech tracking-[0.2em] text-[#888] uppercase">02 / LIBERTAD</span>
            <h3 className="font-serif-title text-base font-medium text-[#121212]">Iluminación Inalámbrica</h3>
            <p className="text-xs text-[#666] font-light leading-relaxed">
              Bombillo inalámbrico recargable incluido, sin cables a la vista, disponible en versión de 3 temperaturas o RGB.
            </p>
          </div>
          <div className="p-8 space-y-2">
            <span className="text-[11px] font-mono-tech tracking-[0.2em] text-[#888] uppercase">03 / LOGÍSTICA</span>
            <h3 className="font-serif-title text-base font-medium text-[#121212]">Envío Asegurado</h3>
            <p className="text-xs text-[#666] font-light leading-relaxed">
              Empaque protector a medida y envíos cotizados a toda Colombia con cobertura total hasta la puerta de tu espacio.
            </p>
          </div>
          <div className="p-8 space-y-2">
            <span className="text-[11px] font-mono-tech tracking-[0.2em] text-[#888] uppercase">04 / ACOMPAÑAMIENTO</span>
            <h3 className="font-serif-title text-base font-medium text-[#121212]">Atención Directa</h3>
            <p className="text-xs text-[#666] font-light leading-relaxed">
              Asesoría personalizada por WhatsApp para elegir escala, colección y acabado según la ubicación de cada lámpara.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Preguntas Frecuentes (FAQ con <details>) */}
      <section className="py-20 px-6 bg-[#FAF9F7] border-b border-[#E8E6E1]" id="faq">
        <div className="max-w-3xl mx-auto space-y-10">
          <div className="space-y-2 text-center">
            <span className="text-[11px] font-mono-tech uppercase tracking-[0.25em] text-[#888]">
              PREGUNTAS FRECUENTES
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif-title font-normal text-[#121212]">
              Detalles de uso y envío
            </h2>
          </div>

          <div className="divide-y divide-[#E8E6E1] border-y border-[#E8E6E1] bg-white px-6">
            <details className="group py-5">
              <summary className="flex cursor-pointer items-center justify-between font-serif-title text-lg text-[#121212] list-none">
                <span>¿Qué incluye cada lámpara?</span>
                <span className="text-xs font-mono-tech text-[#888] group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="mt-3 text-sm text-[#666] font-light leading-relaxed">
                Cada pieza incluye la lámpara escultórica, un bombillo inalámbrico recargable y su cable de carga USB. Puedes elegir la versión de 3 temperaturas de luz (cálida, neutra y fría) o la versión RGB multicolor según el ambiente que quieras crear.
              </p>
            </details>

            <details className="group py-5">
              <summary className="flex cursor-pointer items-center justify-between font-serif-title text-lg text-[#121212] list-none">
                <span>¿Cómo funciona el bombillo inalámbrico?</span>
                <span className="text-xs font-mono-tech text-[#888] group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="mt-3 text-sm text-[#666] font-light leading-relaxed">
                El bombillo inalámbrico recargable se carga fácilmente con el cable incluido y te permite ubicar la lámpara en mesas auxiliares, repisas o centros de mesa sin depender de tomas cercanas ni cables visibles. Permite alternar entre sus modos de 3 temperaturas o colores RGB y regular la intensidad.
              </p>
            </details>

            <details className="group py-5">
              <summary className="flex cursor-pointer items-center justify-between font-serif-title text-lg text-[#121212] list-none">
                <span>¿Cómo se limpia y cuida la pieza?</span>
                <span className="text-xs font-mono-tech text-[#888] group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="mt-3 text-sm text-[#666] font-light leading-relaxed">
                Recomendamos limpiar el polvo con un paño seco de microfibra o un plumero suave. Evita el contacto directo con agua, solventes abrasivos o la exposición prolongada a fuentes de calor intenso.
              </p>
            </details>

            <details className="group py-5">
              <summary className="flex cursor-pointer items-center justify-between font-serif-title text-lg text-[#121212] list-none">
                <span>¿Cuáles son los tiempos de entrega y garantía?</span>
                <span className="text-xs font-mono-tech text-[#888] group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="mt-3 text-sm text-[#666] font-light leading-relaxed">
                Las piezas en stock se despachan en 1 a 2 días hábiles y las referencias bajo pedido entre 3 y 5 días hábiles. Todos los envíos viajan asegurados a cualquier ciudad de Colombia y cuentan con garantía por defectos de fábrica o daños durante el transporte.
              </p>
            </details>
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
