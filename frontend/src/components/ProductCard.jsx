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
    <article className="product-card" data-slug={product.slug}>
      <div className="product-card-image-wrap">
        <img
          src={product.image_url}
          alt={product.name}
          className="product-card-image"
          loading="lazy"
        />
        <span className="product-badge-ondemand">Bajo demanda</span>
      </div>

      <div className="product-card-content">
        <div className="product-card-header">
          <h3 className="product-title">{product.name}</h3>
          <p className="product-dimensions">{product.dimensions}</p>
        </div>

        <p className="product-description">{product.description}</p>

        {product.colors && product.colors.length > 0 && (
          <div className="product-color-selector">
            <span className="color-label">
              Color: <strong>{selectedColor || 'No seleccionado'}</strong>
            </span>
            <div className="color-options" role="radiogroup" aria-label="Colores de filamento">
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
                    className={`color-swatch-btn ${isSelected ? 'active' : ''}`}
                    onClick={() => setSelectedColor(color)}
                    style={{ backgroundColor: hex }}
                  >
                    <span className="sr-only">{color}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="product-card-footer">
          <div className="product-price-block">
            <span className="product-price-label">Precio</span>
            <span className="product-price-val">{formatCOP(product.price)} COP</span>
          </div>
          <div className="product-card-actions">
            <button
              type="button"
              className="btn-add-to-cart"
              onClick={handleAddToCart}
            >
              + Carrito
            </button>
            <button
              type="button"
              className="btn-details"
              onClick={() => onSelectDetail({ ...product, selectedColor })}
            >
              Detalles
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
