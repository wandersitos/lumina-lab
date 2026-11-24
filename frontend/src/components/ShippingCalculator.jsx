import { useState } from 'react';
import { useCart } from '../context/CartContext.jsx';
import { formatCOP } from './ProductCard.jsx';

const COLOMBIAN_CITIES = [
  { city: 'Medellín', department: 'Antioquia', defaultCarrier: 'Coordinadora', baseRate: 10000, days: '1-2 días hábiles' },
  { city: 'Bogotá', department: 'Cundinamarca', defaultCarrier: 'Servientrega', baseRate: 13500, days: '2-3 días hábiles' },
  { city: 'Cali', department: 'Valle del Cauca', defaultCarrier: 'Envía', baseRate: 14000, days: '2-3 días hábiles' },
  { city: 'Barranquilla', department: 'Atlántico', defaultCarrier: 'Coordinadora', baseRate: 16000, days: '3-4 días hábiles' },
  { city: 'Bucaramanga', department: 'Santander', defaultCarrier: 'Servientrega', baseRate: 14500, days: '2-3 días hábiles' },
  { city: 'Cartagena', department: 'Bolívar', defaultCarrier: 'Coordinadora', baseRate: 16000, days: '3-4 días hábiles' },
  { city: 'Pereira', department: 'Risaralda', defaultCarrier: 'Servientrega', baseRate: 14000, days: '2-3 días hábiles' },
  { city: 'Manizales', department: 'Caldas', defaultCarrier: 'Servientrega', baseRate: 14000, days: '2-3 días hábiles' },
  { city: 'Otra ciudad / Nacional', department: 'Colombia', defaultCarrier: 'Interrapidísimo', baseRate: 18000, days: '3-5 días hábiles' },
];

export default function ShippingCalculator() {
  const { totalItems, shippingQuote, setShippingQuote } = useCart();
  const [selectedCity, setSelectedCity] = useState(shippingQuote?.city || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const handleCityChange = async (e) => {
    const cityName = e.target.value;
    setSelectedCity(cityName);
    setError(null);

    if (!cityName) {
      setShippingQuote(null);
      return;
    }

    const cityObj = COLOMBIAN_CITIES.find((c) => c.city === cityName) || {
      city: cityName,
      department: 'Colombia',
      defaultCarrier: 'Interrapidísimo',
      baseRate: 18000,
      days: '3-5 días hábiles',
    };

    setLoading(true);

    try {
      const res = await fetch(`${apiUrl}/api/shipping/quote/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: cityObj.city,
          department: cityObj.department,
          items_count: Math.max(1, totalItems),
        }),
      });

      if (!res.ok) {
        throw new Error('Error al cotizar en el servidor');
      }

      const data = await res.json();
      setShippingQuote(data);
    } catch {
      // Fallback local calibrado para robustez offline/test
      const itemsCount = Math.max(1, totalItems);
      const additional = (itemsCount - 1) * 2500;
      setShippingQuote({
        city: cityObj.city,
        department: cityObj.department,
        carrier: cityObj.defaultCarrier,
        cost: cityObj.baseRate + additional,
        estimated_days: cityObj.days,
        currency: 'COP',
        items_count: itemsCount,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="shipping-calculator">
      <label htmlFor="shipping-city-select" className="shipping-label">
        Cotizar envío nacional (Envíoclick):
      </label>
      <div className="shipping-select-wrap">
        <select
          id="shipping-city-select"
          className="shipping-select"
          value={selectedCity}
          onChange={handleCityChange}
        >
          <option value="">Selecciona tu ciudad en Colombia...</option>
          {COLOMBIAN_CITIES.map((c) => (
            <option key={c.city} value={c.city}>
              {c.city} ({c.department})
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="shipping-status-msg">Calculando mejor tarifa de envío...</p>}
      {error && <p className="shipping-error-msg">{error}</p>}

      {shippingQuote && !loading && (
        <div className="shipping-result-card">
          <div className="shipping-carrier-info">
            <span className="shipping-carrier-badge">🚚 {shippingQuote.carrier}</span>
            <span className="shipping-time">{shippingQuote.estimated_days}</span>
          </div>
          <div className="shipping-rate-row">
            <span>Tarifa de envío:</span>
            <strong className="shipping-cost">{formatCOP(shippingQuote.cost)} COP</strong>
          </div>
        </div>
      )}
    </div>
  );
}
