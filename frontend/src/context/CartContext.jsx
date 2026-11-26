import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

const STORAGE_KEY = 'lumina_lab_cart';

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [shippingQuote, setShippingQuote] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Error saving cart to localStorage:', e);
    }
  }, [items]);

  const addToCart = (product, selectedColor = null, quantity = 1, selectedOptions = []) => {
    const color = selectedColor || (product.colors && product.colors[0]) || 'Estándar';
    const normalizedOptions = Array.isArray(selectedOptions) ? selectedOptions : [];
    const optionsKey = normalizedOptions
      .slice()
      .sort((a, b) => (a.groupSlug || '').localeCompare(b.groupSlug || ''))
      .map((opt) => `${opt.groupSlug}:${opt.optionSlug}`)
      .join('|');
    const itemId = optionsKey
      ? `${product.id || product.slug}-${color}-${optionsKey}`
      : `${product.id || product.slug}-${color}`;

    const optionsDelta = normalizedOptions.reduce(
      (sum, opt) => sum + Number(opt.priceDelta || 0),
      0
    );
    const unitPrice =
      product.effectivePrice !== undefined
        ? Number(product.effectivePrice)
        : Number(product.price) + optionsDelta;

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.cartItemId === itemId);
      if (existingIndex > -1) {
        const next = [...prevItems];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity,
        };
        return next;
      }
      return [
        ...prevItems,
        {
          cartItemId: itemId,
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: unitPrice,
          dimensions: product.dimensions,
          productionTime: product.productionTime || '',
          image_url: product.image_url,
          color,
          selectedOptions: normalizedOptions,
          quantity,
        },
      ];
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (cartItemId) => {
    setItems((prevItems) => prevItems.filter((item) => item.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) => (item.cartItemId === cartItemId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
    setShippingQuote(null);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const shippingCost = shippingQuote?.cost || 0;

  const total = subtotal + shippingCost;

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        subtotal,
        shippingQuote,
        shippingCost,
        total,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        setShippingQuote,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
