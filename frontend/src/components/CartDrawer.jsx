import { useEffect } from 'react';
import { useCart } from '../context/CartContext.jsx';
import { formatCOP } from './ProductCard.jsx';
import { siteConfig } from '../config/site.js';

export default function CartDrawer() {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    subtotal,
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
  const formatItemOptions = (item) => {
    if (!Array.isArray(item.selectedOptions) || item.selectedOptions.length === 0) return '';
    return item.selectedOptions
      .map((opt) => `${opt.groupName}: ${opt.optionName}`)
      .join(' · ');
  };

  const generateWhatsAppMessage = () => {
    let msg = `¡Hola Lumina Lab! Deseo realizar el siguiente pedido de lámparas:\n\n`;
    items.forEach((item, index) => {
      const optsText = formatItemOptions(item);
      msg += `${index + 1}. ${item.name}${optsText ? ` [${optsText}]` : ''}${
        item.dimensions ? ` (${item.dimensions})` : ''
      } x ${item.quantity} = ${formatCOP(item.price * item.quantity)} COP\n`;
    });
    msg += `\nSubtotal productos: ${formatCOP(subtotal)} COP`;
    msg += `\nEnvío: Por cotizar`;
    msg += `\n*TOTAL A PAGAR: ${formatCOP(subtotal)} COP*`;
    msg += `\n\n¿Me confirman disponibilidad y datos para el pago? ¡Gracias!`;
    return encodeURIComponent(msg);
  };

  const whatsappUrl = `https://wa.me/${siteConfig.social.whatsapp.number.replace(
    /[^0-9]/g,
    ''
  )}?text=${generateWhatsAppMessage()}`;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end transition-opacity"
      onClick={() => setIsCartOpen(false)}
    >
      <aside
        className="w-full max-w-md bg-[#FAF9F7] border-l border-[#E5E2DA] shadow-2xl flex flex-col h-full transform transition-transform"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Carrito de compras"
        aria-modal="true"
      >
        {/* Drawer Header */}
        <div className="p-6 border-b border-[#E8E6E1] flex justify-between items-center bg-white">
          <div>
            <h3 className="font-serif-title text-xl font-medium text-[#121212]">Tu Bolsa de Compra</h3>
            <span className="text-[10px] font-mono-tech tracking-widest text-[#888] uppercase block mt-0.5">
              LUMINA LAB • ATELIER 3D
            </span>
          </div>
          <button
            type="button"
            className="text-xs font-mono-tech uppercase tracking-widest px-3 py-1.5 hover:text-black text-[#666] border border-transparent hover:border-[#DDD] transition-colors"
            onClick={() => setIsCartOpen(false)}
            aria-label="Cerrar bolsa"
          >
            Cerrar [✕]
          </button>
        </div>

        {/* Drawer Body */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
            <span className="text-4xl">💡</span>
            <h4 className="font-serif-title text-xl text-[#121212]">Tu bolsa está vacía</h4>
            <p className="text-xs text-[#666] font-light max-w-xs leading-relaxed">
              Explora nuestro catálogo y elige tu lámpara de autor con su acabado y color de filamento favorito.
            </p>
            <button
              type="button"
              className="px-6 py-3 bg-[#121212] text-white text-[11px] font-mono-tech uppercase tracking-[0.2em] hover:bg-black transition-colors"
              onClick={() => setIsCartOpen(false)}
            >
              Explorar Catálogo
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Items List */}
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.cartItemId}
                  className="flex gap-4 pb-4 border-b border-[#ECE9E2] items-start"
                >
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-16 h-20 object-cover rounded-sm bg-[#EFECE6] border border-[#DDD] shrink-0"
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-serif-title text-sm font-medium text-[#121212] leading-snug">
                        {item.name}
                      </h4>
                      <span className="font-mono-tech text-xs font-semibold text-[#121212] ml-2 shrink-0">
                        {formatCOP(item.price * item.quantity)} COP
                      </span>
                    </div>

                    {Array.isArray(item.selectedOptions) && item.selectedOptions.length > 0 && (
                      <p className="text-[11px] font-mono-tech text-[#555]">
                        {item.selectedOptions
                          .map((opt) => `${opt.groupName}: ${opt.optionName}`)
                          .join(' · ')}
                      </p>
                    )}

                    {item.dimensions && (
                      <p className="text-[11px] font-mono-tech text-[#777]">
                        {item.dimensions}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      <div className="inline-flex items-center border border-[#DDD] bg-white rounded-sm">
                        <button
                          type="button"
                          className="px-2.5 py-0.5 text-xs text-[#666] hover:text-black font-mono-tech"
                          onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                          aria-label="Disminuir cantidad"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-mono-tech font-medium text-[#121212]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          className="px-2.5 py-0.5 text-xs text-[#666] hover:text-black font-mono-tech"
                          onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                          aria-label="Aumentar cantidad"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        className="text-[10px] font-mono-tech text-red-700 hover:text-red-900 uppercase underline"
                        onClick={() => removeFromCart(item.cartItemId)}
                        aria-label="Eliminar producto"
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Resumen de totales */}
            <div className="p-4 bg-white border border-[#E0DED7] rounded-sm space-y-2.5 text-xs font-mono-tech">
              <div className="flex justify-between text-[#666]">
                <span>Subtotal lámparas:</span>
                <span className="font-medium text-[#121212]">{formatCOP(subtotal)} COP</span>
              </div>
              <div className="pt-2 border-t border-[#E8E6E1] flex justify-between items-baseline text-sm">
                <span className="font-semibold text-[#121212] uppercase tracking-wider">Total a pagar:</span>
                <span className="text-base font-bold text-[#121212]">{formatCOP(subtotal)} COP</span>
              </div>
            </div>
          </div>
        )}

        {/* Drawer Actions Footer */}
        {items.length > 0 && (
          <div className="p-6 bg-white border-t border-[#E8E6E1] space-y-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 bg-[#0F5132] hover:bg-[#0B3D26] text-white text-[11px] font-mono-tech uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-smooth shadow-md"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824z"/>
              </svg>
              <span>Confirmar Pedido vía WhatsApp ({formatCOP(subtotal)} COP)</span>
            </a>

            <button
              type="button"
              className="w-full text-center py-2 text-[11px] font-mono-tech uppercase tracking-wider text-[#666] hover:text-black"
              onClick={() => setIsCartOpen(false)}
            >
              Seguir explorando lámparas
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
