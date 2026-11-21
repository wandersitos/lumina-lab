import React, { useState } from 'react';
import { useCart } from '../context/CartContext.jsx';
import { siteConfig } from '../config/site.js';

// Paleta visual para los filamentos de Lumina Lab
const COLOR_HEX_MAP = {
  'Blanco Cálido': '#F4EBD9',
  'Terracota': '#D97443',
  'Verde Salvia': '#9CB096',
  'Negro Mate': '#222222',
  'Gris Ceniza': '#8E9297',
  'Ocre Cálido': '#D49B35',
};

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
  const [selectedColor, setSelectedColor] = useState(
    product.colors && product.colors.length > 0 ? product.colors[0] : 'Blanco Cálido'
  );
  const [imgSrc, setImgSrc] = useState(product.image_url || product.image || FALLBACK_IMAGE);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product, selectedColor, 1);
  };

  const handleBuyWhatsApp = (e) => {
    e.stopPropagation();
    const wppNumber = siteConfig.social?.whatsapp?.number || '573001234567';
    const message = encodeURIComponent(
      `Hola Lumina Lab! Estoy interesado en la lámpara *${product.name}* (${formatCOP(product.price)} COP) en color ${selectedColor || 'estándar'}. ¿Tienen disponibilidad?`
    );
    window.open(`https://wa.me/${wppNumber}?text=${message}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <article
      className="group flex flex-col justify-between product-card bg-white border border-[#E8E6E1] hover:border-black/30 transition-all duration-300"
      data-slug={product.slug}
    >
      {/* 4:5 Aspect Ratio Image Frame con estética sobria Astro Lighting */}
      <div
        className="relative aspect-[4/5] bg-[#F7F6F3] overflow-hidden flex items-center justify-center p-6 cursor-pointer border-b border-[#E8E6E1]"
        onClick={() => onSelectDetail && onSelectDetail({ ...product, selectedColor })}
      >
        {/* Badges discretos */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 items-start">
          <span className="px-2 py-0.5 bg-white/95 backdrop-blur-sm border border-black/5 text-[9px] font-mono-tech uppercase tracking-widest text-[#121212] font-semibold product-badge-ondemand">
            {product.inStock ? 'En Stock' : 'Bajo demanda'}
          </span>
          {product.category && (
            <span className="px-2 py-0.5 bg-black/5 text-[8px] font-mono-tech uppercase tracking-wider text-[#555]">
              {product.category}
            </span>
          )}
        </div>

        <img
          src={imgSrc}
          alt={product.name}
          onError={() => setImgSrc(FALLBACK_IMAGE)}
          className="w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
        />

        {/* Acciones flotantes al pasar el cursor */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col gap-1.5">
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
      </div>

      {/* Detalles del Producto */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Muestras de color / Filamento */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex items-center gap-2 product-color-selector">
              <div className="color-options color-swatches flex items-center gap-1.5" role="radiogroup" aria-label="Colores de filamento">
                {product.colors.map((color) => {
                  const hex = COLOR_HEX_MAP[color] || '#CCCCCC';
                  const isSelected = selectedColor === color;
                  return (
                    <button
                      key={color}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      title={color}
                      className={`color-swatch-btn color-swatch w-3.5 h-3.5 rounded-full border transition-all ${
                        isSelected ? 'ring-2 ring-offset-1 ring-[#121212] border-black' : 'border-black/20 hover:border-black'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedColor(color);
                      }}
                      style={{ backgroundColor: hex }}
                    >
                      <span className="sr-only">{color}</span>
                    </button>
                  );
                })}
              </div>
              <span className="text-[9px] font-mono-tech text-[#888] uppercase tracking-wider">
                {selectedColor}
              </span>
            </div>
          )}

          {/* Nombre y Precio */}
          <div>
            <h3
              className="font-serif-title text-base sm:text-lg font-medium text-[#121212] product-title hover:underline cursor-pointer leading-snug"
              onClick={() => onSelectDetail && onSelectDetail({ ...product, selectedColor })}
            >
              {product.name}
            </h3>
            <span className="font-mono-tech text-sm font-semibold text-[#121212] block mt-1">
              {formatCOP(product.price)} COP
            </span>
          </div>

          <p className="text-xs text-[#666] font-light line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Footer de Tarjeta */}
        <div className="pt-3 border-t border-[#F0EFEA] flex items-center justify-between text-[11px] font-mono-tech text-[#777]">
          <span>{product.dimensions || 'PLA Ecológico'}</span>
          <button
            type="button"
            className="hover:text-black uppercase tracking-wider text-[10px] underline btn-details transition-colors"
            onClick={() => onSelectDetail && onSelectDetail({ ...product, selectedColor })}
          >
            Ver Ficha
          </button>
        </div>
      </div>
    </article>
  );
}
