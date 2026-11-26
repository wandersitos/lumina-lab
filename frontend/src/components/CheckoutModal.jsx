import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext.jsx';
import { formatCOP } from './ProductCard.jsx';
import { siteConfig } from '../config/site.js';

export default function CheckoutModal() {
  const {
    items,
    subtotal,
    shippingQuote,
    shippingCost,
    total,
    isCheckoutOpen,
    setIsCheckoutOpen,
    clearCart,
  } = useCart();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: shippingQuote?.city || 'Medellín',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [orderResult, setOrderResult] = useState(null);

  useEffect(() => {
    if (shippingQuote?.city) {
      setFormData((prev) => ({ ...prev, city: shippingQuote.city }));
    }
  }, [shippingQuote]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isCheckoutOpen) {
        handleClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCheckoutOpen]);

  if (!isCheckoutOpen) return null;

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setOrderResult(null);
    setSubmitError(null);
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'El nombre completo es obligatorio.';
    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es obligatorio.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Ingresa un correo electrónico válido.';
    }
    if (!formData.phone.trim()) newErrors.phone = 'El teléfono o WhatsApp es obligatorio.';
    if (!formData.address.trim()) newErrors.address = 'La dirección de entrega es obligatoria.';
    if (!formData.city.trim()) newErrors.city = 'La ciudad de destino es obligatoria.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (items.length === 0) {
      setSubmitError('El carrito está vacío. Agrega productos antes de confirmar.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const payload = {
      customer_name: formData.name.trim(),
      customer_email: formData.email.trim(),
      customer_phone: formData.phone.trim(),
      shipping_address: formData.address.trim(),
      shipping_city: formData.city.trim(),
      items: items.map((item) => {
        const optsText = Array.isArray(item.selectedOptions) && item.selectedOptions.length > 0
          ? item.selectedOptions.map((o) => `${o.groupName}: ${o.optionName}`).join(', ')
          : '';
        return {
          product_id: item.id,
          name: item.name,
          variant: optsText ? `${item.color} (${optsText})` : item.color,
          selected_options: item.selectedOptions || [],
          price: item.price,
          quantity: item.quantity,
        };
      }),
      shipping_cost: shippingCost,
    };

    try {
      const response = await fetch(`${apiUrl}/api/checkout/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ocurrió un error al procesar el pedido.');
      }

      // Orden creada exitosamente
      setOrderResult(data);
      clearCart();
    } catch (err) {
      setSubmitError(err.message || 'Error de conexión con el servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mensaje estructurado para WhatsApp
  const generateWhatsAppMessage = () => {
    if (!orderResult) return '';
    const cleanNumber = siteConfig.social.whatsapp.number.replace(/[^0-9]/g, '');
    const msg = `¡Hola Lumina Lab! Acabo de confirmar mi pedido en la tienda web.\n\n` +
      `*Número de Pedido:* ${orderResult.order_number}\n` +
      `*Cliente:* ${formData.name}\n` +
      `*Teléfono:* ${formData.phone}\n` +
      `*Dirección:* ${formData.address}\n` +
      `*Ciudad:* ${formData.city}\n\n` +
      `*Total a pagar:* ${formatCOP(orderResult.total_amount || total)} COP\n\n` +
      `¿Me confirman recepción para el despacho? ¡Muchas gracias!`;

    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="checkout-modal-backdrop" onClick={handleClose}>
      <div
        className="checkout-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-modal-title"
      >
        <div className="checkout-modal-header">
          <h2 id="checkout-modal-title">
            {orderResult ? '¡Pedido Confirmado!' : 'Finalizar Pedido'}
          </h2>
          <button
            type="button"
            className="checkout-close-btn"
            onClick={handleClose}
            aria-label="Cerrar ventana de checkout"
          >
            &times;
          </button>
        </div>

        {orderResult ? (
          /* Pantalla de confirmación y cierre */
          <div className="checkout-success-view">
            <div className="success-badge-icon">✓</div>
            <h3>¡Gracias por tu compra, {formData.name}!</h3>
            <p className="success-instruction">
              Tu orden ha sido registrada formalmente en nuestro sistema con el identificador:
            </p>
            <div className="order-number-pill">
              <span className="order-number-label">N.° de Pedido:</span>
              <strong className="order-number-code">{orderResult.order_number}</strong>
            </div>

            <div className="order-details-box">
              <div className="order-detail-row">
                <span>Entrega en:</span>
                <strong>{formData.address}, {formData.city}</strong>
              </div>
              <div className="order-detail-row">
                <span>Total consolidado:</span>
                <strong className="order-total-highlight">
                  {formatCOP(orderResult.total_amount)} COP
                </strong>
              </div>
              <div className="order-detail-row">
                <span>Estado:</span>
                <span className="order-status-badge">{orderResult.status}</span>
              </div>
            </div>

            {/* Condicional de pasarela de pago vs Pedidos por WhatsApp */}
            {siteConfig.payments && siteConfig.payments.gatewayEnabled ? (
              <div className="gateway-payment-action">
                <p>Procede con el pago en línea a través de nuestra pasarela:</p>
                <a
                  href={orderResult.payment_url}
                  className="btn-pay-online"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Pagar en línea ({formatCOP(orderResult.total_amount)} COP)
                </a>
              </div>
            ) : (
              <div className="whatsapp-checkout-action">
                <p className="whatsapp-note">
                  Para coordinar la fabricación 3D y el envío inmediato, envía tu pedido directamente a nuestro equipo de WhatsApp:
                </p>
                <a
                  href={generateWhatsAppMessage()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp-confirm"
                >
                  <span>Completar pedido por WhatsApp ✨</span>
                  <span className="btn-icon">💬</span>
                </a>
              </div>
            )}

            <button
              type="button"
              className="btn-close-checkout"
              onClick={handleClose}
            >
              Cerrar y volver a la tienda
            </button>
          </div>
        ) : (
          /* Formulario de Checkout */
          <form className="checkout-form" onSubmit={handleSubmit} noValidate>
            <div className="checkout-form-grid">
              {/* Columna de datos de entrega */}
              <div className="checkout-inputs-col">
                <h3>Datos de Entrega y Contacto</h3>

                {submitError && (
                  <div className="checkout-error-alert" role="alert">
                    {submitError}
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="customer-name">Nombre completo *</label>
                  <input
                    id="customer-name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ej. Laura Gómez"
                    className={errors.name ? 'input-error' : ''}
                    autoFocus
                  />
                  {errors.name && <span className="field-error">{errors.name}</span>}
                </div>

                <div className="form-group-row">
                  <div className="form-group">
                    <label htmlFor="customer-email">Correo electrónico *</label>
                    <input
                      id="customer-email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="laura@ejemplo.com"
                      className={errors.email ? 'input-error' : ''}
                    />
                    {errors.email && <span className="field-error">{errors.email}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="customer-phone">Teléfono / WhatsApp *</label>
                    <input
                      id="customer-phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="300 123 4567"
                      className={errors.phone ? 'input-error' : ''}
                    />
                    {errors.phone && <span className="field-error">{errors.phone}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="shipping-address">Dirección de entrega *</label>
                  <input
                    id="shipping-address"
                    name="address"
                    type="text"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Calle, Carrera, N.° de casa o Apto"
                    className={errors.address ? 'input-error' : ''}
                  />
                  {errors.address && <span className="field-error">{errors.address}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="shipping-city">Ciudad de destino *</label>
                  <input
                    id="shipping-city"
                    name="city"
                    type="text"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Ej. Medellín, Bogotá, Cali..."
                    className={errors.city ? 'input-error' : ''}
                  />
                  {errors.city && <span className="field-error">{errors.city}</span>}
                </div>
              </div>

              {/* Columna de resumen de pedido */}
              <div className="checkout-summary-col">
                <h3>Resumen del Pedido</h3>
                <div className="checkout-items-preview">
                  {items.map((item) => (
                    <div key={item.cartItemId} className="checkout-item-line">
                      <div className="checkout-item-info">
                        <span className="checkout-item-name">{item.name}</span>
                        <span className="checkout-item-meta">
                          {item.color}
                          {Array.isArray(item.selectedOptions) && item.selectedOptions.length > 0
                            ? ` · ${item.selectedOptions.map((o) => `${o.groupName}: ${o.optionName}`).join(' · ')}`
                            : ''}
                          {' '}&times; {item.quantity}
                        </span>
                      </div>
                      <span className="checkout-item-sub">
                        {formatCOP(item.price * item.quantity)} COP
                      </span>
                    </div>
                  ))}
                </div>

                <div className="checkout-totals-box">
                  <div className="checkout-total-row">
                    <span>Subtotal lámparas:</span>
                    <span>{formatCOP(subtotal)} COP</span>
                  </div>
                  <div className="checkout-total-row">
                    <span>Costo de envío:</span>
                    <span>
                      {shippingQuote ? `${formatCOP(shippingCost)} COP` : 'Calculado en cotización'}
                    </span>
                  </div>
                  <div className="checkout-total-row checkout-grand-total">
                    <strong>Total a pagar:</strong>
                    <strong>{formatCOP(total)} COP</strong>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-submit-order"
                  disabled={isSubmitting || items.length === 0}
                >
                  {isSubmitting ? 'Procesando pedido...' : `Confirmar Pedido • ${formatCOP(total)} COP`}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
