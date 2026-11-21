import { useState } from 'react';
import { useCart } from '../context/CartContext.jsx';

// Paleta visual para los filamentos de Lumina Lab
const COLOR_HEX_MAP = {
  'Blanco Cálido': '#F4EBD9',
  'Terracota': '#D97443',
  'Verde Salvia': '#9CB096',
  'Negro Mate': '#222222',
  'Gris Ceniza': '#8E9297',
  'Ocre Cálido': '#D49B35',
};

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
    product.colors && product.colors.length > 0 ? product.colors[0] : null
  );

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product, selectedColor, 1);
  };

  return (
    <article
      className="group flex flex-col justify-between product-card bg-white border border-[#E8E6E1] rounded-sm p-4 hover:shadow-xl transition-smooth"
      data-slug={product.slug}
    >
      {/* 4:5 Aspect Ratio Image Frame with Hover Action */}
      <div
        className="relative aspect-[4/5] bg-[#F4F2ED] overflow-hidden rounded-sm border border-[#EAE7E0] flex items-center justify-center p-4 cursor-pointer"
        onClick={() => onSelectDetail && onSelectDetail({ ...product, selectedColor })}
      >
        <span className="absolute top-3 left-3 z-10 px-2.5 py-1 bg-white/95 backdrop-blur-sm border border-black/5 text-[9px] font-mono-tech uppercase tracking-widest text-[#121212] font-semibold product-badge-ondemand">
          Bajo demanda
        </span>

        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-smooth duration-500 rounded-sm"
          loading="lazy"
        />

        {/* Quick Add Overlay */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-smooth">
          <button
            type="button"
            onClick={handleAddToCart}
            className="w-full py-3 bg-[#121212] text-white text-[11px] font-mono-tech tracking-[0.2em] uppercase hover:bg-black transition-colors shadow-lg btn-add-to-cart"
          >
            + Carrito
          </button>
        </div>
      </div>

      {/* Card Details */}
      <div className="mt-4 space-y-3">
        {/* Color Swatches */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex items-center gap-2 pt-1 product-color-selector">
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
                    className={`color-swatch-btn color-swatch w-4 h-4 rounded-full border ${
                      isSelected ? 'ring-2 ring-offset-1 ring-[#121212] border-black/50' : 'border-black/20'
                    }`}
                    onClick={() => setSelectedColor(color)}
                    style={{ backgroundColor: hex }}
                  >
                    <span className="sr-only">{color}</span>
                  </button>
                );
              })}
            </div>
            <span className="text-[10px] font-mono-tech text-[#888] ml-1 uppercase">
              {selectedColor || `${product.colors.length} tonos`}
            </span>
          </div>
        )}

        <div className="flex justify-between items-baseline gap-2">
          <h3
            className="font-serif-title text-lg font-medium text-[#121212] product-title hover:underline cursor-pointer"
            onClick={() => onSelectDetail && onSelectDetail({ ...product, selectedColor })}
          >
            {product.name}
          </h3>
          <span className="font-mono-tech text-sm font-semibold text-[#121212] shrink-0">
            {formatCOP(product.price)} COP
          </span>
        </div>

        <p className="text-xs text-[#666] font-light line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        <div className="pt-2 border-t border-[#EFECE6] flex items-center justify-between text-xs font-mono-tech text-[#777]">
          <span>{product.dimensions || 'Iluminación LED E27'}</span>
          <button
            type="button"
            className="hover:text-black uppercase tracking-wider text-[10px] underline btn-details"
            onClick={() => onSelectDetail && onSelectDetail({ ...product, selectedColor })}
          >
            Ver Detalles
          </button>
        </div>
      </div>
    </article>
  );
}
