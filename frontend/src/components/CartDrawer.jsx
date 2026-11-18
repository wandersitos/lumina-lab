import { useEffect } from 'react';
import { useCart } from '../context/CartContext.jsx';
import { formatCOP } from './ProductCard.jsx';
import ShippingCalculator from './ShippingCalculator.jsx';
import { siteConfig } from '../config/site.js';

export default function CartDrawer() {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    setIsCheckoutOpen,
    removeFromCart,
    updateQuantity,
    subtotal,
    shippingQuote,
    shippingCost,
    total,
  } = useCart();

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isCartOpen) {
        setIsCartOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartOpen, setIsCartOpen]);

  if (!isCartOpen) return null;

  // Generar mensaje estructurado de WhatsApp
  const generateWhatsAppMessage = () => {
    let msg = `¡Hola Lumina Lab! Deseo realizar el siguiente pedido de lámparas 3D:\n\n`;
    items.forEach((item, index) => {
      msg += `${index + 1}. ${item.name} (${item.color}) x ${item.quantity} = ${formatCOP(
        item.price * item.quantity
      )} COP\n`;
    });
    msg += `\nSubtotal productos: ${formatCOP(subtotal)} COP`;
    if (shippingQuote) {
      msg += `\nEnvío a ${shippingQuote.city} (${shippingQuote.carrier}): ${formatCOP(
        shippingCost
      )} COP`;
    } else {
      msg += `\nEnvío: Por cotizar`;
    }
    msg += `\n*TOTAL A PAGAR: ${formatCOP(total)} COP*`;
    msg += `\n\n¿Me confirman disponibilidad y datos para el pago? ¡Gracias!`;
    return encodeURIComponent(msg);
  };

  const whatsappUrl = `https://wa.me/${siteConfig.social.whatsapp.number.replace(
    /[^0-9]/g,
    ''
  )}?text=${generateWhatsAppMessage()}`;

  return (
    <div className="cart-drawer-backdrop" onClick={() => setIsCartOpen(false)}>
      <aside
        className="cart-drawer"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Carrito de compras"
        aria-modal="true"
      >
        <div className="cart-drawer-header">
          <div className="cart-header-title-wrap">
            <span className="cart-header-icon">🛒</span>
            <h2>Tu Carrito Lumina Lab</h2>
          </div>
          <button
            type="button"
            className="cart-close-btn"
            onClick={() => setIsCartOpen(false)}
            aria-label="Cerrar carrito"
          >
            &times;
          </button>
        </div>

        {items.length === 0 ? (
          <div className="cart-empty-state">
            <span className="cart-empty-icon">💡</span>
            <h3>Tu carrito está vacío</h3>
            <p>Explora nuestro catálogo y elige tu lámpara de diseño con su color de filamento favorito.</p>
            <button
              type="button"
              className="btn-cta-primary"
              onClick={() => setIsCartOpen(false)}
            >
              Ver Catálogo
            </button>
          </div>
        ) : (
          <div className="cart-drawer-body">
            <div className="cart-items-list">
              {items.map((item) => (
                <div key={item.cartItemId} className="cart-item-row">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="cart-item-thumbnail"
                  />
                  <div className="cart-item-info">
                    <h4 className="cart-item-name">{item.name}</h4>
                    <span className="cart-item-color">Color: {item.color}</span>
                    <span className="cart-item-price-unit">{formatCOP(item.price)} COP</span>
                    
                    <div className="cart-item-controls">
                      <div className="cart-qty-selector">
                        <button
                          type="button"
                          className="btn-qty-minus"
                          onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                          aria-label="Disminuir cantidad"
                        >
                          -
                        </button>
                        <span className="cart-qty-value">{item.quantity}</span>
                        <button
                          type="button"
                          className="btn-qty-plus"
                          onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                          aria-label="Aumentar cantidad"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        className="btn-cart-remove"
                        onClick={() => removeFromCart(item.cartItemId)}
                        aria-label="Eliminar producto"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                  <div className="cart-item-total-col">
                    <span className="cart-item-subtotal">
                      {formatCOP(item.price * item.quantity)} COP
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Cotizador de envíos con Envíoclick */}
            <ShippingCalculator />

            {/* Resumen de totales */}
            <div className="cart-summary-section">
              <div className="cart-summary-row">
                <span>Subtotal lámparas:</span>
                <span>{formatCOP(subtotal)} COP</span>
              </div>
              <div className="cart-summary-row">
                <span>Costo de envío:</span>
                <span>
                  {shippingQuote ? `${formatCOP(shippingCost)} COP` : 'Calcula tu ciudad'}
                </span>
              </div>
              <div className="cart-summary-row cart-total-row">
                <strong>Total a pagar:</strong>
                <strong className="cart-total-amount">{formatCOP(total)} COP</strong>
              </div>
            </div>

            <div className="cart-actions-footer">
              <button
                type="button"
                className="btn-proceed-checkout"
                onClick={() => {
                  setIsCartOpen(false);
                  setIsCheckoutOpen(true);
                }}
              >
                Proceder al Checkout
              </button>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-checkout-whatsapp"
              >
                <span>Pedir directo por WhatsApp</span>
                <span className="btn-checkout-price">{formatCOP(total)} COP</span>
              </a>
              <button
                type="button"
                className="btn-continue-shopping"
                onClick={() => setIsCartOpen(false)}
              >
                Seguir explorando lámparas
              </button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
