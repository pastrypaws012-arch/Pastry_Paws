import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

const STORAGE_KEY = 'pastry_paws_cart_v1';

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cartItems]);

  /**
   * Helper to parse numeric price from string or number
   */
  const parsePrice = (priceVal) => {
    if (typeof priceVal === 'number') return priceVal;
    if (!priceVal) return 0;
    const cleaned = String(priceVal).replace(/[^0-9.]/g, '');
    return parseFloat(cleaned) || 0;
  };

  /**
   * Add item to cart with portion, addons, and quantity
   */
  const addToCart = (item, selectedTier, quantity = 1, selectedAddons = []) => {
    if (!item) return;

    const tier = selectedTier || item.pricingDetails?.[0] || {
      size: 'Standard',
      price: item.startingPrice ? `₹${item.startingPrice}/-` : '₹299/-',
    };

    const unitPrice = parsePrice(tier.price) || item.startingPrice || 0;

    const cleanedAddons = Array.isArray(selectedAddons)
      ? selectedAddons
          .map((a) => ({
            name: typeof a.name === 'string' ? a.name.trim() : '',
            price: parsePrice(a.price),
          }))
          .filter((a) => a.name.length > 0)
      : [];

    const addonsUnitTotal = cleanedAddons.reduce((sum, a) => sum + a.price, 0);
    const validQty = Math.max(1, parseInt(quantity, 10) || 1);

    // Generate unique key by item ID, size, and sorted addons
    const addonsHash = cleanedAddons
      .map((a) => `${a.name}:${a.price}`)
      .sort()
      .join('|');
    const itemId = item._id || item.id || item.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const cartKey = `${itemId}__${tier.size}__${addonsHash}`;

    setCartItems((prevItems) => {
      const existingIdx = prevItems.findIndex((it) => it.cartKey === cartKey);

      if (existingIdx !== -1) {
        const updated = [...prevItems];
        const newQty = updated[existingIdx].quantity + validQty;
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: newQty,
          itemTotal: (unitPrice + addonsUnitTotal) * newQty,
        };
        return updated;
      }

      const newItem = {
        cartKey,
        itemId,
        itemTitle: item.title,
        category: item.category || '',
        selectedSize: tier.size,
        unitPrice,
        quantity: validQty,
        selectedAddons: cleanedAddons,
        addonsUnitTotal,
        itemTotal: (unitPrice + addonsUnitTotal) * validQty,
        itemImage: item.image || '',
        originalItem: item,
      };

      return [...prevItems, newItem];
    });

    return true;
  };

  /**
   * Update quantity of a cart item
   */
  const updateQuantity = (cartKey, newQuantity) => {
    const qty = parseInt(newQuantity, 10);
    if (isNaN(qty) || qty <= 0) {
      removeFromCart(cartKey);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.cartKey === cartKey) {
          const itemTotal = (item.unitPrice + item.addonsUnitTotal) * qty;
          return { ...item, quantity: qty, itemTotal };
        }
        return item;
      })
    );
  };

  /**
   * Remove item completely from cart
   */
  const removeFromCart = (cartKey) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.cartKey !== cartKey));
  };

  /**
   * Empty the entire cart
   */
  const clearCart = () => {
    setCartItems([]);
  };

  const totalItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((sum, item) => sum + item.itemTotal, 0);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const openCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };
  const closeCheckout = () => setIsCheckoutOpen(false);

  const value = {
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalItemsCount,
    cartSubtotal,
    isCartOpen,
    setIsCartOpen,
    openCart,
    closeCart,
    isCheckoutOpen,
    setIsCheckoutOpen,
    openCheckout,
    closeCheckout,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
