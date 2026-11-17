import { useState, useEffect } from 'react';
import ProductCard from './ProductCard.jsx';
import ProductDetailModal from './ProductDetailModal.jsx';

// Catálogo semilla de fallback por si la API aún no está disponible o durante carga
const FALLBACK_PRODUCTS = [
  {
    id: 1,
    name: 'Lámpara Vórtice',
    slug: 'lampara-vortice',
    description: 'Diseño helicoidal orgánico con entramado geométrico que difumina la luz suavemente en 360 grados. Fabricada mediante impresión 3D aditiva de alta precisión.',
    price: 120000,
    dimensions: '24 x 16 cm',
    image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80',
    colors: ['Blanco Cálido', 'Terracota', 'Verde Salvia', 'Negro Mate'],
    is_active: true,
  },
  {
    id: 2,
    name: 'Lámpara Eclipse',
    slug: 'lampara-eclipse',
    description: 'Estructura minimalista de doble anillo con halo de luz indirecta de acento arquitectónico contemporáneo.',
    price: 145000,
    dimensions: '28 x 20 cm',
    image_url: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=600&q=80',
    colors: ['Blanco Cálido', 'Terracota', 'Gris Ceniza'],
    is_active: true,
  },
  {
    id: 3,
    name: 'Lámpara Aurora',
    slug: 'lampara-aurora',
    description: 'Silueta fluida con curvas biomórficas inspiradas en ondas de luz nórdicas, ideal para mesas de noche y espacios cálidos.',
    price: 95000,
    dimensions: '18 x 12 cm',
    image_url: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=600&q=80',
    colors: ['Blanco Cálido', 'Verde Salvia', 'Ocre Cálido'],
    is_active: true,
  },
];

export default function ProductGrid() {
  const [products, setProducts] = useState(FALLBACK_PRODUCTS);
  const [loading, setLoading] = useState(true);
  const [activeDetailProduct, setActiveDetailProduct] = useState(null);
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    fetch(`${apiUrl}/api/products/`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Error en API catálogo: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.warn('Usando catálogo local de contingencia:', err.message);
        setLoading(false);
      });
  }, [apiUrl]);

  return (
    <section className="catalog-section" id="catalogo">
      <div className="catalog-container">
        <div className="section-header">
          <span className="section-badge">Colección Luminarias</span>
          <h2 className="section-title">Nuestras Lámparas de Diseño 3D</h2>
          <p className="section-subtitle">
            Cada lámpara se imprime en filamento PLA ecológico bajo demanda. Selecciona tu modelo y tono favorito.
          </p>
        </div>

        {loading && <p className="catalog-loading">Cargando catálogo oficial...</p>}

        <div className="product-grid">
          {products.map((product) => (
            <ProductCard
              key={product.id || product.slug}
              product={product}
              onSelectDetail={(prod) => setActiveDetailProduct(prod)}
            />
          ))}
        </div>
      </div>

      {activeDetailProduct && (
        <ProductDetailModal
          product={activeDetailProduct}
          onClose={() => setActiveDetailProduct(null)}
        />
      )}
    </section>
  );
}
