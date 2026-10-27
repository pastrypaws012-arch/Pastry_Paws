import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

export function CartDrawer() {
  const {
    cartItems,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalItemsCount,
    cartSubtotal,
    openCheckout,
  } = useCart();

  const navigate = useNavigate();

  const handleExploreMenu = () => {
    closeCart();
    navigate('/menu');
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeCart}
            className="absolute inset-0 bg-[#411C10]/60 backdrop-blur-xs"
          />

          {/* Drawer Container */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="w-screen max-w-md bg-[#FFF9F3] shadow-2xl flex flex-col border-l border-[#D29C83]/30"
            >
              {/* Drawer Header */}
              <div className="px-5 py-4.5 bg-[#FEEDDD]/90 border-b border-[#D29C83]/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#7C3F27] text-[#FEEDDD] flex items-center justify-center shadow-2xs">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-serif text-lg font-medium text-[#411C10] leading-none">
                      Your Sweet Cart
                    </h2>
                    <p className="text-[11px] text-[#A66D54] mt-0.5">
                      {totalItemsCount} {totalItemsCount === 1 ? 'treat' : 'treats'} selected
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeCart}
                  className="w-8 h-8 rounded-full bg-[#FFF9F3] hover:bg-[#FEE5D2] text-[#7C3F27] flex items-center justify-center border border-[#D29C83]/40 transition-colors cursor-pointer"
                  aria-label="Close cart drawer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
                {cartItems.length > 0 ? (
                  cartItems.map((item) => (
                    <div
                      key={item.cartKey}
                      className="bg-[#FFFDFB] rounded-2xl p-3.5 border border-[#D29C83]/35 shadow-2xs flex gap-3 relative group"
                    >
                      {/* Thumbnail */}
                      <img
                        src={item.itemImage || 'https://res.cloudinary.com/ku59ko3p/image/upload/v1792430625/PastryPaws/hero-cake.jpg'}
                        alt={item.itemTitle}
                        className="w-20 h-20 rounded-xl object-cover shrink-0 bg-[#FEEDDD]/60 border border-[#D29C83]/30"
                      />

                      {/* Item Details */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-1.5">
                            <h3 className="font-serif text-sm font-semibold text-[#411C10] truncate">
                              {item.itemTitle}
                            </h3>
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.cartKey)}
                              className="text-[#A66D54] hover:text-rose-600 transition-colors p-0.5 cursor-pointer shrink-0"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[11px] font-medium text-[#7C3F27] bg-[#FEEDDD] px-2 py-0.5 rounded-md border border-[#D29C83]/30">
                              {item.selectedSize}
                            </span>
                            <span className="text-[11px] text-[#A66D54]">
                              ₹{item.unitPrice}/-
                            </span>
                          </div>

                          {/* Selected Add-ons */}
                          {item.selectedAddons && item.selectedAddons.length > 0 && (
                            <div className="mt-1.5 flex flex-wrap gap-1">
                              {item.selectedAddons.map((addon, aIdx) => (
                                <span
                                  key={aIdx}
                                  className="text-[10px] bg-[#FFF2E6] text-[#7C3F27] px-1.5 py-0.5 rounded border border-[#D29C83]/25 font-medium"
                                >
                                  + {addon.name} (+₹{addon.price})
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Quantity and Line Total */}
                        <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[#D29C83]/20">
                          {/* Quantity Selector */}
                          <div className="flex items-center bg-[#FEEDDD]/80 rounded-lg border border-[#D29C83]/40 p-0.5">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.cartKey, item.quantity - 1)}
                              className="w-6 h-6 rounded flex items-center justify-center text-[#7C3F27] hover:bg-[#FFF9F3] transition-colors cursor-pointer"
                              title="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-7 text-center text-xs font-bold text-[#411C10]">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.cartKey, item.quantity + 1)}
                              className="w-6 h-6 rounded flex items-center justify-center text-[#7C3F27] hover:bg-[#FFF9F3] transition-colors cursor-pointer"
                              title="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Line total */}
                          <span className="text-sm font-bold text-[#7C3F27]">
                            ₹{item.itemTotal}/-
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-16 px-4 text-center">
                    <div className="w-16 h-16 rounded-full bg-[#FEEDDD] text-[#7C3F27] flex items-center justify-center mx-auto mb-4 border border-[#D29C83]/40 shadow-inner">
                      <ShoppingBag className="w-8 h-8 opacity-60" />
                    </div>
                    <h3 className="font-serif text-lg text-[#411C10] font-normal">
                      Your Cart is Empty
                    </h3>
                    <p className="text-xs text-[#7C3F27]/80 mt-1.5 max-w-xs mx-auto leading-relaxed">
                      You haven’t added any sweet treats yet. Explore our handcrafted creations and treat yourself!
                    </p>
                    <button
                      type="button"
                      onClick={handleExploreMenu}
                      className="mt-6 inline-flex items-center gap-2 bg-[#7C3F27] text-[#FEEDDD] hover:bg-[#5E2B19] px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide shadow-md transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#F9C8B5]" />
                      <span>Explore Menu Creations</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Drawer Footer (Only when items exist) */}
              {cartItems.length > 0 && (
                <div className="p-4 sm:p-5 bg-[#FEEDDD]/70 border-t border-[#D29C83]/30 space-y-3">
                  {/* Bill Breakdown */}
                  <div className="space-y-1.5 text-xs text-[#6E4738]">
                    <div className="flex justify-between">
                      <span>Treats Subtotal:</span>
                      <span className="font-semibold text-[#411C10]">₹{cartSubtotal}/-</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span>Artisan Box Packaging:</span>
                      <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Complimentary (₹0)
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold text-[#411C10] pt-2 border-t border-[#D29C83]/25">
                      <span>Total Payable:</span>
                      <span className="text-base text-[#7C3F27]">₹{cartSubtotal}/-</span>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <button
                    type="button"
                    onClick={openCheckout}
                    className="w-full flex items-center justify-center gap-2 bg-[#7C3F27] hover:bg-[#5E2B19] text-[#FEEDDD] py-3 px-5 rounded-2xl text-sm font-semibold tracking-wide transition-all shadow-md hover:shadow-lg active:scale-[0.99] cursor-pointer"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4 text-[#F9C8B5]" />
                  </button>

                  <div className="flex items-center justify-between text-[11px] text-[#A66D54] px-1">
                    <button
                      type="button"
                      onClick={clearCart}
                      className="hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      Clear entire cart
                    </button>
                    <button
                      type="button"
                      onClick={closeCart}
                      className="hover:text-[#411C10] font-medium transition-colors cursor-pointer"
                    >
                      + Add more items
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
