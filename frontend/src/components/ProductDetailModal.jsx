import { useEffect, useState } from 'react';
import { formatCOP } from './ProductCard.jsx';
import { siteConfig } from '../config/site.js';
import { useCart } from '../context/CartContext.jsx';

export default function ProductDetailModal({ product, onClose }) {
  const { addToCart } = useCart();
  const [selectedOptionsByGroup, setSelectedOptionsByGroup] = useState({});

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    const groups = Array.isArray(product?.option_groups) ? product.option_groups : [];
    if (groups.length === 0) {
      setSelectedOptionsByGroup({});
      return;
    }
    const initial = {};
    for (const group of groups) {
      initial[group.slug] = (group.options || []).find((o) => o.in_stock) || null;
    }
    setSelectedOptionsByGroup(initial);
  }, [product]);

  if (!product) return null;

  const optionGroups = Array.isArray(product.option_groups) ? product.option_groups : [];
  const allGroupsAvailable = optionGroups.every(
    (g) => Boolean(selectedOptionsByGroup[g.slug] && selectedOptionsByGroup[g.slug].in_stock)
  );
  const optionsDelta = optionGroups.reduce(
    (sum, g) => sum + Number(selectedOptionsByGroup[g.slug]?.price_delta || 0),
    0
  );
  const effectivePrice = Number(product.price || 0) + optionsDelta;
  const selectedOptionsPayload = optionGroups
    .map((g) => {
      const opt = selectedOptionsByGroup[g.slug];
      if (!opt) return null;
      return {
        groupId: g.id,
        groupSlug: g.slug,
        groupName: g.name,
        optionId: opt.id,
        optionSlug: opt.slug,
        optionName: opt.name,
        priceDelta: Number(opt.price_delta || 0),
      };
    })
    .filter(Boolean);

  const optsText = selectedOptionsPayload.length
    ? ` [${selectedOptionsPayload.map((o) => `${o.groupName}: ${o.optionName}`).join(', ')}]`
    : '';
  const message = encodeURIComponent(
    `¡Hola! Estoy interesado en ordenar la ${product.name}${optsText}${
      product.dimensions ? ` (${product.dimensions})` : ''
    } por ${formatCOP(effectivePrice)} COP de Lumina Lab.`
  );
  const whatsappUrl = `https://wa.me/${siteConfig.social.whatsapp.number.replace(/[^0-9]/g, '')}?text=${message}`;

  const handleSelectOption = (groupSlug, option) => {
    if (!option.in_stock) return;
    setSelectedOptionsByGroup((prev) => ({
      ...prev,
      [groupSlug]: option,
    }));
  };

  const handleAddToCart = () => {
    if (!allGroupsAvailable) return;
    addToCart({ ...product, effectivePrice }, null, 1, selectedOptionsPayload);
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
            <p className="modal-price">{formatCOP(effectivePrice)} COP</p>

            {optionGroups.length > 0 && (
              <div className="space-y-3 my-3">
                {optionGroups.map((group) => {
                  const selected = selectedOptionsByGroup[group.slug];
                  return (
                    <div key={group.id || group.slug} className="space-y-1.5">
                      <span className="text-[11px] font-mono-tech uppercase tracking-wider font-semibold text-[#121212] block">
                        {group.name}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {(group.options || []).map((opt) => {
                          const isSelected = selected?.slug === opt.slug;
                          const isAvailable = Boolean(opt.in_stock);
                          const delta = Number(opt.price_delta || 0);
                          return (
                            <button
                              key={opt.id || opt.slug}
                              type="button"
                              disabled={!isAvailable}
                              onClick={() => handleSelectOption(group.slug, opt)}
                              className={`px-3 py-1.5 rounded-md border text-xs font-mono-tech transition-all flex items-center gap-1.5 ${
                                !isAvailable
                                  ? 'bg-[#F3F2EE] border-[#E5E3DD] text-[#999] cursor-not-allowed opacity-75'
                                  : isSelected
                                  ? 'bg-[#121212] text-white border-[#121212]'
                                  : 'bg-white text-[#121212] border-[#D8D5CD] hover:border-[#121212]'
                              }`}
                            >
                              <span className={!isAvailable ? 'line-through' : ''}>{opt.name}</span>
                              {delta !== 0 && isAvailable && (
                                <span>
                                  {delta > 0 ? `+${formatCOP(delta)}` : `-${formatCOP(Math.abs(delta))}`}
                                </span>
                              )}
                              {!isAvailable && (
                                <span className="px-1.5 py-0.5 text-[9px] uppercase rounded bg-[#E5E3DD] text-[#666] font-semibold">
                                  Agotada
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="modal-specs">
              <div className="spec-item">
                <span className="spec-label">Dimensiones y medidas:</span>
                <span className="spec-value">{product.dimensions || '24 x 16 cm'}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Tipo de iluminación:</span>
                <span className="spec-value">LED Cálida 2700K difusa (socket universal E27 incluida)</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Material de impresión:</span>
                <span className="spec-value">PLA biodegradable de origen vegetal de alta resistencia</span>
              </div>
            </div>

            <div className="modal-ondemand-notice">
              <strong>⚡ Fabricación bajo demanda:</strong> Cada pieza se imprime de forma individual tras tu pedido. Tiempo estimado de impresión y acabado: <strong>2 a 3 días hábiles</strong>.
            </div>

            <p className="modal-description">{product.description}</p>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-modal-add-cart"
                disabled={!allGroupsAvailable}
                onClick={handleAddToCart}
              >
                {allGroupsAvailable ? '🛒 Añadir al carrito' : 'Opción agotada'}
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
