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
  const [activeFilter, setActiveFilter] = useState('all');
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
    <section className="py-20 px-6 max-w-7xl mx-auto catalog-section" id="catalogo">
      {/* Section Header with Category Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-6 border-b border-[#E8E6E1] gap-6">
        <div className="space-y-2">
          <span className="text-[11px] font-mono-tech uppercase tracking-[0.25em] text-[#888]">
            CATÁLOGO DE EDICIONES
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif-title font-normal text-[#121212]">
            Colección de Iluminación 3D
          </h2>
          <p className="text-xs sm:text-sm text-[#666] font-light max-w-lg">
            Cada lámpara se imprime en filamento PLA ecológico bajo demanda. Selecciona tu modelo y tono favorito.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 font-mono-tech text-[11px] uppercase tracking-wider">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 transition-colors ${
              activeFilter === 'all'
                ? 'bg-[#121212] text-white'
                : 'bg-transparent text-[#666] hover:text-black border border-[#E0DED7]'
            }`}
          >
            Todas las Piezas ({products.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('table')}
            className={`px-4 py-2 transition-colors ${
              activeFilter === 'table'
                ? 'bg-[#121212] text-white'
                : 'bg-transparent text-[#666] hover:text-black border border-[#E0DED7]'
            }`}
          >
            Lámparas de Mesa
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('night')}
            className={`px-4 py-2 transition-colors ${
              activeFilter === 'night'
                ? 'bg-[#121212] text-white'
                : 'bg-transparent text-[#666] hover:text-black border border-[#E0DED7]'
            }`}
          >
            Esculturas de Noche
          </button>
        </div>
      </div>

      {loading && (
        <p className="text-center py-12 text-xs font-mono-tech uppercase tracking-wider text-[#888] catalog-loading">
          Cargando catálogo oficial...
        </p>
      )}

      {/* Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 product-grid">
        {products.map((product) => (
          <ProductCard
            key={product.id || product.slug}
            product={product}
            onSelectDetail={(prod) => setActiveDetailProduct(prod)}
          />
        ))}
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
