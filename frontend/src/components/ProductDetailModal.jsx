import { useEffect } from 'react';
import { formatCOP } from './ProductCard.jsx';
import { siteConfig } from '../config/site.js';
import { useCart } from '../context/CartContext.jsx';

export default function ProductDetailModal({ product, onClose }) {
  const { addToCart } = useCart();

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!product) return null;

  const colorText = product.selectedColor ? ` en color ${product.selectedColor}` : '';
  const message = encodeURIComponent(
    `¡Hola! Estoy interesado en ordenar la ${product.name}${colorText} (${product.dimensions}) por ${formatCOP(product.price)} COP de Lumina Lab.`
  );
  const whatsappUrl = `https://wa.me/${siteConfig.social.whatsapp.number.replace(/[^0-9]/g, '')}?text=${message}`;

  const handleAddToCart = () => {
    addToCart(product, product.selectedColor, 1);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-product-title">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Cerrar detalles del producto"
        >
          &times;
        </button>

        <div className="modal-body-grid">
          <div className="modal-image-col">
            <img
              src={product.image_url}
              alt={product.name}
              className="modal-product-image"
            />
          </div>

          <div className="modal-info-col">
            <span className="modal-badge-brand">Lumina Lab · Edición 3D</span>
            <h2 id="modal-product-title" className="modal-title">{product.name}</h2>
            <p className="modal-price">{formatCOP(product.price)} COP</p>

            <div className="modal-specs">
              <div className="spec-item">
                <span className="spec-label">Dimensiones y medidas:</span>
                <span className="spec-value">{product.dimensions || '24 x 16 cm'}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Material de impresión:</span>
                <span className="spec-value">PLA biodegradable de origen vegetal de alta resistencia</span>
              </div>
              {product.selectedColor && (
                <div className="spec-item">
                  <span className="spec-label">Color seleccionado:</span>
                  <span className="spec-value">{product.selectedColor}</span>
                </div>
              )}
            </div>

            <div className="modal-ondemand-notice">
              <strong>⚡ Fabricación bajo demanda:</strong> Cada pieza se imprime de forma individual tras tu pedido. Tiempo estimado de impresión y acabado: <strong>2 a 3 días hábiles</strong>.
            </div>

            <p className="modal-description">{product.description}</p>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-modal-add-cart"
                onClick={handleAddToCart}
              >
                🛒 Añadir al carrito
              </button>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-modal-order"
              >
                Pedir directo WhatsApp
              </a>
              <button
                type="button"
                className="btn-modal-back"
                onClick={onClose}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
