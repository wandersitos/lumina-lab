import React from 'react';

export default function ProductFilters({
  selectedCollections = [],
  onToggleCollection,
  selectedCategories = [],
  onToggleCategory,
  inStockOnly = false,
  onToggleInStock,
  onClearFilters,
  hasActiveFilters = false,
  counts = {},
}) {
  return (
    <aside className="product-filters w-full space-y-8 text-[#121212]" aria-label="Filtros de catálogo">
      {/* Header Filtros con Reset */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E8E6E1]">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-[#121212]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <h2 className="text-xs font-mono-tech uppercase tracking-[0.2em] font-semibold text-[#121212]">
            Filtros
          </h2>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="text-[11px] font-mono-tech tracking-wider uppercase text-[#888] hover:text-black underline transition-colors btn-clear-filters"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Sección: Colección */}
      <div className="space-y-3 filter-section-collection">
        <h3 className="text-[11px] font-mono-tech uppercase tracking-[0.2em] text-[#666] font-medium">
          Colección
        </h3>
        <div className="space-y-2">
          {[
            { id: 'leora', label: 'Colección Leora', subtitle: 'Lámparas Esculpidas' },
            { id: 'kumo', label: 'Serie Kumo', subtitle: 'Bases y Pantallas' },
          ].map((item) => {
            const isChecked = selectedCollections.includes(item.id);
            const count = counts.collections?.[item.id] ?? 0;
            const isDisabled = count === 0;
            return (
              <label
                key={item.id}
                className={`flex items-start gap-3 py-1 text-xs select-none transition-opacity ${
                  isDisabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : 'cursor-pointer group'
                }`}
              >
                <div className="pt-0.5">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    disabled={isDisabled}
                    onChange={() => onToggleCollection(item.id)}
                    className="sr-only"
                  />
                  <div
                    className={`w-4 h-4 border rounded-none transition-colors flex items-center justify-center ${
                      isChecked
                        ? 'bg-[#121212] border-[#121212] text-white'
                        : isDisabled
                        ? 'border-[#E0E0E0] bg-[#F5F5F5]'
                        : 'border-[#CCC] group-hover:border-black bg-white'
                    }`}
                  >
                    {isChecked && (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <div className="flex-1 flex justify-between items-baseline">
                  <div>
                    <span className={`block font-serif-title ${isChecked ? 'font-medium text-black' : isDisabled ? 'text-[#888]' : 'text-[#333]'}`}>
                      {item.label}
                    </span>
                    <span className="text-[10px] font-mono-tech text-[#888] tracking-wider uppercase">
                      {item.subtitle}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono-tech text-[#999] ml-2">
                    ({count})
                  </span>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Sección: Categoría */}
      <div className="space-y-3 pt-4 border-t border-[#E8E6E1] filter-section-category">
        <h3 className="text-[11px] font-mono-tech uppercase tracking-[0.2em] text-[#666] font-medium">
          Categoría
        </h3>
        <div className="space-y-2">
          {[
            { id: 'Sculpted', label: 'Sculpted' },
            { id: 'Mini', label: 'Mini' },
            { id: 'Bases', label: 'Bases' },
            { id: 'Lampshades', label: 'Pantallas' },
          ].map((item) => {
            const isChecked = selectedCategories.includes(item.id);
            const count = counts.categories?.[item.id] ?? 0;
            const isDisabled = count === 0;
            return (
              <label
                key={item.id}
                className={`flex items-center gap-3 py-1 text-xs select-none transition-opacity ${
                  isDisabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : 'cursor-pointer group'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  disabled={isDisabled}
                  onChange={() => onToggleCategory(item.id)}
                  className="sr-only"
                />
                <div
                  className={`w-4 h-4 border rounded-none transition-colors flex items-center justify-center ${
                    isChecked
                      ? 'bg-[#121212] border-[#121212] text-white'
                      : isDisabled
                      ? 'border-[#E0E0E0] bg-[#F5F5F5]'
                      : 'border-[#CCC] group-hover:border-black bg-white'
                  }`}
                >
                  {isChecked && (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 flex justify-between items-center">
                  <span className={`font-mono-tech text-[12px] uppercase tracking-wider ${isChecked ? 'font-semibold text-black' : isDisabled ? 'text-[#888]' : 'text-[#444]'}`}>
                    {item.label}
                  </span>
                  <span className="text-[10px] font-mono-tech text-[#999]">
                    ({count})
                  </span>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Sección: Disponibilidad */}
      <div className="space-y-3 pt-4 border-t border-[#E8E6E1] filter-section-availability">
        <h3 className="text-[11px] font-mono-tech uppercase tracking-[0.2em] text-[#666] font-medium">
          Disponibilidad
        </h3>
        {(() => {
          const inStockCount = counts.inStock ?? 0;
          const isStockDisabled = inStockCount === 0;
          return (
            <label className={`flex items-center gap-3 py-1 text-xs select-none transition-opacity ${
              isStockDisabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : 'cursor-pointer group'
            }`}>
              <input
                type="checkbox"
                checked={inStockOnly}
                disabled={isStockDisabled}
                onChange={onToggleInStock}
                className="sr-only"
              />
              <div
                className={`w-4 h-4 border rounded-none transition-colors flex items-center justify-center ${
                  inStockOnly
                    ? 'bg-[#121212] border-[#121212] text-white'
                    : isStockDisabled
                    ? 'border-[#E0E0E0] bg-[#F5F5F5]'
                    : 'border-[#CCC] group-hover:border-black bg-white'
                }`}
              >
                {inStockOnly && (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div className="flex-1 flex justify-between items-center">
                <span className={`font-mono-tech text-[12px] uppercase tracking-wider ${inStockOnly ? 'font-semibold text-black' : isStockDisabled ? 'text-[#888]' : 'text-[#444]'}`}>
                  En Stock
                </span>
                <span className="text-[10px] font-mono-tech text-[#999]">
                  ({inStockCount})
                </span>
              </div>
            </label>
          );
        })()}
      </div>
    </aside>
  );
}
