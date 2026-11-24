import React, { useState } from 'react';
import { useCart } from '../context/CartContext.jsx';
import { siteConfig } from '../config/site.js';

// Imagen de contingencia arquitectónica sobria
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80';

export function formatCOP(amount) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function ProductCard({ product, onSelectDetail }) {
  const { addToCart } = useCart();
  const [imgSrc, setImgSrc] = useState(
    product.image_url || product.alternativeImage || product.image || FALLBACK_IMAGE
  );

  const productUrl = `/product/${product.slug}`;

  // Manejo de navegación que respeta el click de la rueda del ratón (botón central) y teclas modificadoras
  const handleLinkClick = (e, path) => {
    // Si el usuario hace click normal izquierdo sin Ctrl ni Cmd, prevenimos navegación completa
    if (e.button === 0 && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) {
      e.preventDefault();
      if (onSelectDetail) {
        onSelectDetail(product);
      }
    }
    // Si presiona con la rueda del ratón (e.button === 1), el navegador abre la pestaña nueva nativamente
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, null, 1);
  };

  const handleBuyWhatsApp = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const wppNumber = siteConfig.social?.whatsapp?.number?.replace(/[^0-9]/g, '') || '573001234567';
    const message = encodeURIComponent(
      `Hola Lumina Lab! Estoy interesado en la lámpara *${product.name}* (${formatCOP(product.price)} COP). ¿Tienen disponibilidad?`
    );
    window.open(`https://wa.me/${wppNumber}?text=${message}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <article
      className="group flex flex-col justify-between product-card bg-white border border-[#E8E6E1] hover:border-black/30 transition-all duration-300 rounded-2xl overflow-hidden shadow-sm hover:shadow-md"
      data-slug={product.slug}
    >
      {/* Contenedor de Imagen 1:1 Cuadrado limpio a sangre, inspirado en la proporción solicitada */}
      <a
        href={productUrl}
        onClick={(e) => handleLinkClick(e, productUrl)}
        className="block relative aspect-square w-full overflow-hidden bg-[#F7F6F3] cursor-pointer"
        aria-label={`Ver detalles de ${product.name}`}
      >
        {/* Badges superiores estilizados en píldora con fondo translúcido */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 pointer-events-none">
          <span className="px-2.5 py-1 bg-white/95 backdrop-blur-md rounded-full text-[9px] font-mono-tech uppercase tracking-wider text-[#121212] font-semibold shadow-sm product-badge-ondemand">
            {product.inStock ? 'En Stock' : 'Bajo Demanda'}
          </span>
          {product.category && (
            <span className="px-2 py-0.5 bg-black/60 backdrop-blur-md rounded-full text-[8px] font-mono-tech uppercase tracking-wider text-white">
              {product.category}
            </span>
          )}
        </div>

        <img
          src={imgSrc}
          alt={product.name}
          onError={() => setImgSrc(FALLBACK_IMAGE)}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
        />

        {/* Acciones flotantes al pasar el cursor */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col gap-1.5 z-20">
          <button
            type="button"
            onClick={handleAddToCart}
            className="w-full py-2.5 bg-[#121212] text-white text-[10px] font-mono-tech tracking-[0.2em] uppercase hover:bg-black transition-colors shadow-md btn-add-to-cart"
          >
            + Añadir a la Bolsa
          </button>
          <button
            type="button"
            onClick={handleBuyWhatsApp}
            className="w-full py-2 bg-[#25D366] text-white text-[10px] font-mono-tech tracking-[0.15em] uppercase hover:bg-[#1ebe5d] transition-colors shadow-md flex items-center justify-center gap-1.5"
          >
            <span>WhatsApp</span>
          </button>
        </div>
      </a>

      {/* Detalles del Producto sin selector de color */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Nombre y Precio */}
          <div>
            <a
              href={productUrl}
              onClick={(e) => handleLinkClick(e, productUrl)}
              className="font-serif-title text-base sm:text-lg font-medium text-[#121212] product-title hover:underline block leading-snug"
            >
              {product.name}
            </a>
            <span className="font-mono-tech text-sm font-semibold text-[#121212] block mt-1">
              {formatCOP(product.price)} COP
            </span>
          </div>

          <p className="text-xs text-[#666] font-light line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Footer de Tarjeta con enlace nativo a ficha */}
        <div className="pt-3 border-t border-[#F0EFEA] flex items-center justify-between text-[11px] font-mono-tech text-[#777]">
          <span>{product.dimensions || 'PLA Ecológico'}</span>
          <a
            href={productUrl}
            onClick={(e) => handleLinkClick(e, productUrl)}
            className="hover:text-black uppercase tracking-wider text-[10px] underline font-mono-tech btn-details transition-colors"
          >
            Ver Ficha
          </a>
        </div>
      </div>
    </article>
  );
}
