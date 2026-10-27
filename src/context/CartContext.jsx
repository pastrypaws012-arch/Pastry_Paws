import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

const STORAGE_KEY = 'pastry_paws_cart_v1';

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
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
   * Clear all items from cart
   */
  const clearCart = () => {
    setCartItems([]);
  };

  /**
   * Helper to get total quantity of an item currently in the cart
   */
  const getItemQuantity = (itemOrId) => {
    if (!itemOrId) return 0;
    const targetId = typeof itemOrId === 'string' ? itemOrId : itemOrId._id || itemOrId.id;
    const targetTitle = typeof itemOrId === 'object' ? itemOrId.title?.toLowerCase() : '';

    return cartItems
      .filter(
        (it) =>
          it.itemId === targetId ||
          (targetTitle && it.itemTitle?.toLowerCase() === targetTitle)
      )
      .reduce((sum, it) => sum + it.quantity, 0);
  };

  /**
   * Increment quantity for an item from card
   */
  const incrementItem = (item, selectedTier) => {
    if (!item) return;
    const targetId = item._id || item.id;
    const targetTitle = item.title?.toLowerCase();

    const existing = cartItems.find(
      (it) =>
        it.itemId === targetId ||
        (targetTitle && it.itemTitle?.toLowerCase() === targetTitle)
    );

    if (existing) {
      updateQuantity(existing.cartKey, existing.quantity + 1);
    } else {
      addToCart(item, selectedTier, 1, []);
    }
  };

  /**
   * Decrement quantity for an item from card (reverts to 0 if count drops below 1)
   */
  const decrementItem = (itemOrId) => {
    if (!itemOrId) return;
    const targetId = typeof itemOrId === 'string' ? itemOrId : itemOrId._id || itemOrId.id;
    const targetTitle = typeof itemOrId === 'object' ? itemOrId.title?.toLowerCase() : '';

    const existing = cartItems.find(
      (it) =>
        it.itemId === targetId ||
        (targetTitle && it.itemTitle?.toLowerCase() === targetTitle)
    );

    if (existing) {
      if (existing.quantity <= 1) {
        removeFromCart(existing.cartKey);
      } else {
        updateQuantity(existing.cartKey, existing.quantity - 1);
      }
    }
  };

  const totalItemsCount = Array.isArray(cartItems)
    ? cartItems.reduce((sum, item) => sum + (Number(item?.quantity) || 0), 0)
    : 0;
  const cartSubtotal = Array.isArray(cartItems)
    ? cartItems.reduce((sum, item) => sum + (Number(item?.itemTotal) || 0), 0)
    : 0;

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
    getItemQuantity,
    incrementItem,
    decrementItem,
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
