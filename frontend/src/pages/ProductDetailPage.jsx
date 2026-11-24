import React, { useState, useEffect } from 'react';
import { siteConfig } from '../config/site.js';
import { products as officialProducts } from '../data/luminaProducts.js';
import ProductCard, { formatCOP } from '../components/ProductCard.jsx';
import { useCart } from '../context/CartContext.jsx';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80';

export default function ProductDetailPage({ slug, onNavigate }) {
  const { addToCart } = useCart();
  const [product, setProduct] = useState(() => {
    return officialProducts.find((p) => p.slug === slug) || null;
  });
  const [activeImage, setActiveImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(!product);
  const [error, setError] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL || '';

  // Helper para navegación respetando click medio (rueda del ratón) y teclas modificadoras
  const handleLinkClick = (e, path) => {
    if (e.button === 0 && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) {
      e.preventDefault();
      if (onNavigate) {
        onNavigate(path);
      }
    }
  };

  useEffect(() => {
    let isMounted = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Buscar en catálogo local inmediato para render instantáneo
    const localProd = officialProducts.find((p) => p.slug === slug);
    if (localProd && isMounted) {
      setProduct(localProd);
      setActiveImage(localProd.image_url || localProd.alternativeImage || localProd.image || '');
    }

    // Consultar API backend para sincronizar inventario, precio y datos en vivo
    const endpoint = apiUrl ? `${apiUrl.replace(/\/+$/, '')}/api/products/${slug}/` : `/api/products/${slug}/`;
    fetch(endpoint)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (isMounted && data) {
          const normalized = {
            ...data,
            inStock: data.in_stock !== undefined ? Boolean(data.in_stock) : Boolean(data.inStock),
            image_url: data.image_url || (data.images && data.images[0]) || data.image || '',
          };
          setProduct(normalized);
          if (!activeImage) {
            setActiveImage(normalized.image_url);
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          if (!localProd) {
            setError(`No pudimos cargar la información del producto (${err.message})`);
          }
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [slug, apiUrl]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center py-20 px-6">
        <div className="w-10 h-10 border-2 border-t-black border-r-transparent border-b-black border-l-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-mono-tech uppercase tracking-[0.2em] text-[#888]">
          Cargando pieza de iluminación...
        </p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-4xl mx-auto py-24 px-6 text-center space-y-6">
        <span className="text-4xl block">💡</span>
        <h1 className="font-serif-title text-3xl text-[#121212]">
          Pieza no encontrada
        </h1>
        <p className="text-sm font-mono-tech text-[#666] max-w-md mx-auto">
          El modelo que estás buscando no existe o ha sido retirado del catálogo.
        </p>
        <div>
          <a
            href="/products"
            onClick={(e) => handleLinkClick(e, '/products')}
            className="inline-block px-8 py-3.5 bg-[#121212] text-white text-[11px] font-mono-tech tracking-[0.2em] uppercase hover:bg-black transition-colors"
          >
            Volver al Catálogo
          </a>
        </div>
      </div>
    );
  }

  // Lista de imágenes para la galería
  const galleryImages = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : [product.image_url || product.image || FALLBACK_IMAGE];

  const currentDisplayImage = activeImage || product.image_url || product.image || FALLBACK_IMAGE;

  // Productos relacionados de la misma colección o categoría (excluyendo el actual)
  const relatedProducts = officialProducts
    .filter((p) => p.slug !== product.slug && (p.collection === product.collection || p.category === product.category))
    .slice(0, 3);

  const handleAddToCart = () => {
    addToCart(product, null, quantity);
  };

  const handleBuyWhatsApp = () => {
    const wppNumber = siteConfig.social?.whatsapp?.number?.replace(/[^0-9]/g, '') || '573001234567';
    const message = encodeURIComponent(
      `¡Hola Lumina Lab! Estoy interesado en ordenar la lámpara *${product.name}* (${product.dimensions || ''}) por ${formatCOP(product.price)} COP. ¿Tienen disponibilidad para envío?`
    );
    window.open(`https://wa.me/${wppNumber}?text=${message}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="product-detail-page bg-[#FAF9F7] text-[#121212]">
      {/* Breadcrumbs de navegación con soporte nativo de nueva pestaña */}
      <nav className="max-w-7xl mx-auto px-6 py-6 border-b border-[#E8E6E1]/60 text-xs font-mono-tech uppercase tracking-wider text-[#888] flex items-center gap-2 flex-wrap">
        <a
          href="/"
          onClick={(e) => handleLinkClick(e, '/')}
          className="hover:text-black transition-colors"
        >
          Inicio
        </a>
        <span className="opacity-40">/</span>
        <a
          href="/products"
          onClick={(e) => handleLinkClick(e, '/products')}
          className="hover:text-black transition-colors"
        >
          Productos
        </a>
        <span className="opacity-40">/</span>
        <span className="text-[#121212] font-semibold">{product.name}</span>
      </nav>

      {/* Main Product Hero */}
      <section className="max-w-7xl mx-auto px-6 py-10 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          
          {/* Columna Izquierda: Galería e Imagen Principal */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-square sm:aspect-[4/5] bg-[#F7F6F3] border border-[#E8E6E1] rounded-2xl overflow-hidden shadow-sm flex items-center justify-center group">
              {/* Badges superiores */}
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                <span className="px-3 py-1 bg-white/95 backdrop-blur-md rounded-full text-[10px] font-mono-tech uppercase tracking-wider text-[#121212] font-semibold shadow-sm">
                  {product.inStock ? 'En Stock' : 'Bajo Demanda'}
                </span>
                {product.category && (
                  <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-mono-tech uppercase tracking-wider text-white">
                    {product.category}
                  </span>
                )}
              </div>

              <img
                src={currentDisplayImage}
                alt={product.name}
                onError={(e) => {
                  e.target.src = FALLBACK_IMAGE;
                }}
                className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              />
            </div>

            {/* Tira de Miniaturas si hay múltiples fotos */}
            {galleryImages.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1">
                {galleryImages.map((img, index) => {
                  const resolvedImg = img.startsWith('http')
                    ? img
                    : (product.alternativeImage && index === 0 ? product.alternativeImage : product.image_url || img);
                  const isSelected = activeImage === resolvedImg || activeImage === img;

                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setActiveImage(resolvedImg)}
                      className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                        isSelected
                          ? 'border-black ring-2 ring-black/20'
                          : 'border-[#E8E6E1] hover:border-black/40 opacity-75 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={resolvedImg}
                        alt={`${product.name} - Vista ${index + 1}`}
                        onError={(e) => {
                          e.target.src = FALLBACK_IMAGE;
                        }}
                        className="w-full h-full object-cover object-center"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Columna Derecha: Información, Precio y Compra */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Cabecera Editorial */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono-tech uppercase tracking-[0.25em] text-[#888] block">
                {product.collection ? `Colección ${product.collection.toUpperCase()}` : 'Edición 3D'} • {product.category || 'Escultural'}
              </span>
              <h1 className="text-3xl sm:text-4xl font-serif-title font-medium text-[#121212] leading-tight">
                {product.name}
              </h1>
              <div className="pt-2">
                <span className="text-2xl sm:text-3xl font-mono-tech font-bold text-[#121212]">
                  {formatCOP(product.price)} COP
                </span>
                <span className="text-xs font-mono-tech text-[#888] block mt-0.5">
                  IVA incluido • Envío asegurado a toda Colombia
                </span>
              </div>
            </div>

            {/* Narrativa del Producto */}
            <p className="text-sm sm:text-base text-[#555] font-light leading-relaxed border-t border-b border-[#E8E6E1] py-4">
              {product.description}
            </p>

            {/* Selector de Cantidad y Acciones de Compra */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-[#121212] bg-white">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-10 h-11 flex items-center justify-center font-mono-tech text-base hover:bg-black/5 transition-colors"
                    aria-label="Disminuir cantidad"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-mono-tech font-semibold text-sm">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-10 h-11 flex items-center justify-center font-mono-tech text-base hover:bg-black/5 transition-colors"
                    aria-label="Aumentar cantidad"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 py-3.5 px-6 bg-[#121212] text-white hover:bg-black text-[11px] font-mono-tech tracking-[0.2em] uppercase transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <span>+ Añadir a la Bolsa</span>
                </button>
              </div>

              {/* Botón WhatsApp Directo */}
              <button
                type="button"
                onClick={handleBuyWhatsApp}
                className="w-full py-3 px-6 bg-[#25D366] text-white hover:bg-[#1ebe5d] text-[11px] font-mono-tech tracking-[0.18em] uppercase transition-all shadow-sm flex items-center justify-center gap-2 font-medium"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.698.057-2.029-.49-1.636-.674-2.703-2.382-2.787-2.493-.082-.111-.664-.882-.664-1.682 0-.8.419-1.194.568-1.356.148-.162.324-.202.432-.202.108 0 .216.002.311.006.1.004.234-.038.366.279.135.324.46 1.121.5 1.202.04.081.067.176.013.283-.054.108-.081.176-.162.27-.081.095-.172.212-.246.284-.082.081-.168.17-.072.335.095.165.422.698.905 1.13.623.555 1.147.727 1.312.809.165.081.261.067.36-.041.099-.108.419-.486.531-.652.113-.165.225-.138.378-.081.153.057.973.459 1.14.542.167.081.279.122.32.19.041.067.041.391-.103.796z"/>
                </svg>
                <span>Pedir directo por WhatsApp</span>
              </button>
            </div>

            {/* Especificaciones y Ficha Técnica */}
            <div className="pt-6 border-t border-[#E8E6E1] space-y-4">
              <h2 className="text-xs font-mono-tech uppercase tracking-[0.2em] font-semibold text-[#121212]">
                Ficha Técnica y Materiales
              </h2>
              
              <div className="grid grid-cols-1 gap-2.5 text-xs font-mono-tech">
                <div className="flex justify-between py-2 border-b border-[#F0EFEA]">
                  <span className="text-[#888]">Dimensiones:</span>
                  <span className="font-medium text-[#121212]">{product.dimensions || '24 x 25 x 25 cm'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#F0EFEA]">
                  <span className="text-[#888]">Material de fabricación:</span>
                  <span className="font-medium text-[#121212]">{product.material || 'PLA Biodegradable ecológico'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#F0EFEA]">
                  <span className="text-[#888]">Tiempo de producción:</span>
                  <span className="font-medium text-[#121212]">
                    {product.deliveryTime || (product.inStock ? 'Envío Inmediato (2-4 días)' : 'Bajo demanda (7-10 días)')}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#F0EFEA]">
                  <span className="text-[#888]">Tecnología de luz:</span>
                  <span className="font-medium text-[#121212]">LED Cálida 2700K difusa (Socket universal E27)</span>
                </div>
              </div>
            </div>

            {/* Píldoras de Confianza */}
            <div className="p-4 bg-white border border-[#E8E6E1] rounded-lg space-y-2 text-xs font-mono-tech text-[#555]">
              <div className="flex items-center gap-2">
                <span>🌱</span>
                <span><strong>Filamento sostenible:</strong> Biopolímero derivado de recursos vegetales renovables.</span>
              </div>
              <div className="flex items-center gap-2">
                <span>💡</span>
                <span><strong>Luz incluida:</strong> Bombillo LED cálido de alta eficiencia energética listo para usar.</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📦</span>
                <span><strong>Envío protegido:</strong> Empaque amortiguado contra impactos a nivel nacional.</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Sección Piezas Relacionadas / Explorar más */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-[#E8E6E1] py-16 px-6 bg-white">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#E8E6E1]">
              <div>
                <span className="text-[11px] font-mono-tech uppercase tracking-[0.25em] text-[#888] block">
                  EXPLORA MÁS PIEZAS
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif-title font-medium text-[#121212]">
                  Lámparas Relacionadas
                </h2>
              </div>
              <a
                href="/products"
                onClick={(e) => handleLinkClick(e, '/products')}
                className="text-xs font-mono-tech uppercase tracking-wider text-[#121212] hover:underline"
              >
                Ver todo el catálogo &rarr;
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {relatedProducts.map((rel) => (
                <ProductCard
                  key={rel.id || rel.slug}
                  product={rel}
                  onSelectDetail={(p) => {
                    if (onNavigate) {
                      onNavigate(`/product/${p.slug}`);
                    }
                  }}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
