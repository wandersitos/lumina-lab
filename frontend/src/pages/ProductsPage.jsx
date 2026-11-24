import React, { useState, useMemo, useEffect } from 'react';
import { products as officialProducts, collections, categories } from '../data/luminaProducts.js';
import ProductCard from '../components/ProductCard.jsx';
import ProductFilters from '../components/ProductFilters.jsx';
import ProductDetailModal from '../components/ProductDetailModal.jsx';

export default function ProductsPage({ onNavigate }) {
  // Inicialización de filtros desde query params de la URL si existen
  const getInitialFilters = () => {
    if (typeof window === 'undefined') {
      return { collections: [], categories: [] };
    }
    const params = new URLSearchParams(window.location.search);
    const collParam = params.get('collection');
    const catParam = params.get('category');

    return {
      collections: collParam ? collParam.split(',').filter(Boolean) : [],
      categories: catParam ? catParam.split(',').filter(Boolean) : [],
    };
  };

  const initial = getInitialFilters();
  const [selectedCollections, setSelectedCollections] = useState(initial.collections);
  const [selectedCategories, setSelectedCategories] = useState(initial.categories);
  const [sortBy, setSortBy] = useState('featured');
  const [activeDetailProduct, setActiveDetailProduct] = useState(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Estado de carga y productos desde API Django
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper para resolver la URL base de la API
  const getApiBaseUrl = () => {
    const envUrl = import.meta.env.VITE_API_URL;
    if (envUrl) {
      return envUrl.replace(/\/+$/, '');
    }
    return '';
  };

  const CACHE_KEY = 'lumina_products_cache_v1';
  const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutos

  // Carga de catálogo con caché y opción de refresco forzado desde BD
  const fetchCatalogFromApi = (forceRefresh = false) => {
    // Si no se fuerza el refresco, verificar si tenemos copia en caché válida
    if (!forceRefresh && typeof window !== 'undefined') {
      try {
        const cached = sessionStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.timestamp && (Date.now() - parsed.timestamp < CACHE_TTL_MS) && Array.isArray(parsed.products)) {
            setProducts(parsed.products);
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        console.warn('Error leyendo caché de catálogo:', e);
      }
    }

    setLoading(true);

    const apiUrl = `${getApiBaseUrl()}/api/products/${forceRefresh ? '?refresh=true' : ''}`;

    fetch(apiUrl, { cache: forceRefresh ? 'no-store' : 'default' })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          const normalized = data.map((item) => ({
            ...item,
            inStock: item.in_stock !== undefined ? Boolean(item.in_stock) : Boolean(item.inStock),
            image: item.image_url || (item.images && item.images[0]) || item.image || '',
          }));
          setProducts(normalized);
          setError(null);

          // Guardar en caché local
          try {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify({
              timestamp: Date.now(),
              products: normalized,
            }));
          } catch (e) {
            console.warn('Error guardando en caché:', e);
          }

        } else {
          setProducts([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.warn('API /api/products/ no disponible, usando catálogo local de respaldo:', err);
        setProducts(officialProducts);
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const forceRefresh = params.get('refresh') === 'true' || params.get('refresh') === '1';
    fetchCatalogFromApi(forceRefresh);
  }, []);

  // Sincronizar cambios en los filtros con la URL para enlaces compartibles
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    
    // Mantener view=products si se usa como query param
    const currentView = params.get('view');

    if (selectedCollections.length > 0) {
      params.set('collection', selectedCollections.join(','));
    } else {
      params.delete('collection');
    }

    if (selectedCategories.length > 0) {
      params.set('category', selectedCategories.join(','));
    } else {
      params.delete('category');
    }

    if (currentView) {
      params.set('view', currentView);
    }

    const newQuery = params.toString() ? `?${params.toString()}` : '';
    const newPath = window.location.pathname + newQuery;
    window.history.replaceState(null, '', newPath);
  }, [selectedCollections, selectedCategories]);

  // Manejadores de toggle de filtros
  const handleToggleCollection = (id) => {
    setSelectedCollections((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleCategory = (id) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleClearFilters = () => {
    setSelectedCollections([]);
    setSelectedCategories([]);
  };

  const hasActiveFilters =
    selectedCollections.length > 0 ||
    selectedCategories.length > 0;

  // Excluir colecciones y componentes no vigentes (Serie Kumo, Bases y Pantallas)
  const isExcludedItem = (p) => {
    const coll = (p.collection || '').toLowerCase();
    const cat = (p.category || '').toLowerCase();
    return coll === 'kumo' || cat === 'bases' || cat === 'lampshades';
  };

  const activeCatalogProducts = useMemo(() => {
    return products.filter((p) => !isExcludedItem(p));
  }, [products]);

  // Conteo de elementos para cada filtro calculado dinámicamente según productos vigentes
  const filterCounts = useMemo(() => {
    const collCounts = { leora: 0 };
    const catCounts = { Sculpted: 0, Mini: 0 };

    activeCatalogProducts.forEach((p) => {
      if (p.collection && collCounts[p.collection] !== undefined) {
        collCounts[p.collection]++;
      }
      if (p.category && catCounts[p.category] !== undefined) {
        catCounts[p.category]++;
      }
    });

    return {
      collections: collCounts,
      categories: catCounts,
    };
  }, [activeCatalogProducts]);

  // Filtrado y ordenamiento de productos
  const filteredProducts = useMemo(() => {
    let result = activeCatalogProducts.filter((p) => {
      // Filtro Colección
      if (selectedCollections.length > 0 && !selectedCollections.includes(p.collection)) {
        return false;
      }
      // Filtro Categoría
      if (selectedCategories.length > 0 && !selectedCategories.includes(p.category)) {
        return false;
      }
      return true;
    });

    // Ordenamiento
    if (sortBy === 'price-asc') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name') {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // featured / default: por orden o ID
      result = [...result].sort((a, b) => (a.order || 99) - (b.order || 99));
    }

    return result;
  }, [activeCatalogProducts, selectedCollections, selectedCategories, sortBy]);

  return (
    <div className="products-page min-h-screen bg-[#FAF9F7] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Breadcrumb minimalista */}
        <nav className="mb-6 text-[10px] font-mono-tech tracking-[0.25em] uppercase text-[#888] flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('/')}
            className="hover:text-black transition-colors"
          >
            Inicio
          </button>
          <span>/</span>
          <span className="text-[#121212] font-semibold">Productos</span>
        </nav>

        {/* Encabezado Principal estilo Astro Lighting */}
        <header className="mb-10 pb-8 border-b border-[#E8E6E1]">
          <span className="text-[11px] font-mono-tech uppercase tracking-[0.25em] text-[#888] block mb-2">
            ATELIER MEDELLÍN • CATÁLOGO COMPLETO
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif-title font-normal text-[#121212] mb-4">
            Catálogo de Iluminación 3D
          </h1>
          <p className="text-sm sm:text-base text-[#666] font-light max-w-2xl leading-relaxed">
            Explora la colección Leora. Diseños escultóricos modelados digitalmente y fabricados capa por capa con biopolímeros botánicos y tecnología LED cálida.
          </p>
        </header>

        {/* Barra de utilidades: Conteo de productos, Botón de filtros móvil, y Selector de orden */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-[#E8E6E1] text-xs font-mono-tech">
          {/* Conteo de productos dinámico */}
          <div className="text-[#666] uppercase tracking-wider products-count">
            Mostrando <span className="font-semibold text-black">{filteredProducts.length}</span> {filteredProducts.length === 1 ? 'producto' : 'productos'}
            {hasActiveFilters && (
              <span className="text-[#999] ml-1">
                (filtrados de {activeCatalogProducts.length})
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Botón Filtros para móvil */}
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 px-3 py-1.5 border border-[#121212] text-[#121212] uppercase tracking-wider text-[11px] hover:bg-black hover:text-white transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span>Filtros {hasActiveFilters ? `(${selectedCollections.length + selectedCategories.length})` : ''}</span>
            </button>

            {/* Controles: Ordenamiento */}
            <div className="flex items-center gap-3">
              <label htmlFor="sortSelect" className="text-[#888] uppercase tracking-wider hidden sm:inline text-xs font-mono-tech">
                Ordenar por:
              </label>
              <select
                id="sortSelect"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border border-[#E0DED7] px-3 py-1.5 text-xs text-[#121212] font-mono-tech tracking-wider uppercase focus:outline-none focus:border-black cursor-pointer"
              >
                <option value="featured">Destacados</option>
                <option value="price-asc">Menor precio</option>
                <option value="price-desc">Mayor precio</option>
                <option value="name">Nombre (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Layout Principal: Sidebar Izquierdo + Grilla de Productos */}
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Sidebar de Filtros Desktop */}
          <div className="hidden lg:block w-64 shrink-0 sticky top-28">
            <ProductFilters
              selectedCollections={selectedCollections}
              onToggleCollection={handleToggleCollection}
              selectedCategories={selectedCategories}
              onToggleCategory={handleToggleCategory}
              onClearFilters={handleClearFilters}
              hasActiveFilters={hasActiveFilters}
              counts={filterCounts}
            />
          </div>

          {/* Grilla de Productos */}
          <div className="flex-1 w-full">
            {loading ? (
              <div className="py-24 text-center space-y-4">
                <div className="inline-block w-8 h-8 border-2 border-t-black border-r-transparent border-b-black border-l-transparent rounded-full animate-spin" />
                <p className="text-xs font-mono-tech uppercase tracking-[0.2em] text-[#888]">
                  Cargando catálogo Lumina Lab...
                </p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-20 text-center bg-white border border-[#E8E6E1] p-12 space-y-4">
                <span className="text-3xl">💡</span>
                <h3 className="font-serif-title text-xl text-[#121212]">
                  No se encontraron piezas
                </h3>
                <p className="text-xs font-mono-tech text-[#666] max-w-md mx-auto leading-relaxed">
                  No hay lámparas que coincidan con la combinación actual de filtros. Prueba modificando la selección o limpiando los filtros.
                </p>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="px-6 py-2.5 bg-[#121212] text-white text-[11px] font-mono-tech tracking-[0.2em] uppercase hover:bg-black transition-colors"
                >
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 product-grid">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id || product.slug}
                    product={product}
                    onSelectDetail={(prod) => {
                      if (onNavigate) {
                        onNavigate(`/product/${prod.slug}`);
                      } else {
                        setActiveDetailProduct(prod);
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal/Drawer de Filtros para Móvil */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-[#FAF9F7] shadow-2xl p-6 overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#E8E6E1] mb-6">
                <span className="text-xs font-mono-tech uppercase tracking-[0.2em] font-semibold">
                  Filtros
                </span>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-1 hover:text-black text-[#666]"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <ProductFilters
                selectedCollections={selectedCollections}
                onToggleCollection={handleToggleCollection}
                selectedCategories={selectedCategories}
                onToggleCategory={handleToggleCategory}
                onClearFilters={handleClearFilters}
                hasActiveFilters={hasActiveFilters}
                counts={filterCounts}
              />
            </div>

            <div className="pt-6 border-t border-[#E8E6E1] mt-8">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full py-3 bg-[#121212] text-white text-xs font-mono-tech tracking-[0.2em] uppercase hover:bg-black"
              >
                Ver {filteredProducts.length} productos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalle */}
      {activeDetailProduct && (
        <ProductDetailModal
          product={activeDetailProduct}
          onClose={() => setActiveDetailProduct(null)}
        />
      )}
    </div>
  );
}
