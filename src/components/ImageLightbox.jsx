import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, ShoppingBag, Check, Plus, Minus, ShoppingCart, Sparkles } from 'lucide-react';
import { WhatsAppIcon } from './Icons';
import { brandConfig } from '../data/brand';
import { useCart } from '../context/CartContext';

export function ImageLightbox({
  isOpen,
  item,
  items = [],
  onClose,
  onPrev,
  onNext,
  onOrderNow,
}) {
  const { addToCart, openCart, openCheckout } = useCart();
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [addedToast, setAddedToast] = useState(false);

  useEffect(() => {
    if (item?.pricingDetails && item.pricingDetails.length > 0) {
      setSelectedSize(item.pricingDetails[0].size);
    } else {
      setSelectedSize('');
    }
    setQuantity(1);
    setSelectedAddons([]);
    setAddedToast(false);
  }, [item]);

  const selectedTier =
    item?.pricingDetails?.find((p) => p.size === selectedSize) ||
    item?.pricingDetails?.[0] || {
      size: 'Standard',
      price: item?.startingPrice ? `₹${item.startingPrice}/-` : '₹299/-',
    };

  const baseUnitPrice =
    parseFloat(String(selectedTier.price).replace(/[^0-9.]/g, '')) || item?.startingPrice || 0;
  const addonsUnitTotal = selectedAddons.reduce((sum, a) => sum + (Number(a.price) || 0), 0);
  const singleItemTotal = baseUnitPrice + addonsUnitTotal;
  const grandTotal = singleItemTotal * quantity;
  const handleKeyDown = useCallback(
    (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && onPrev) onPrev();
      if (e.key === 'ArrowRight' && onNext) onNext();
    },
    [isOpen, onClose, onPrev, onNext]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown, isOpen]);

  if (!item) return null;

  const whatsappInquiryUrl = `https://wa.me/${brandConfig.contact.whatsappNumber}?text=${encodeURIComponent(
    `Hello! I'm interested in ordering something similar to your "${item.title}" (${item.category}).`
  )}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-8">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#411C10]/85 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className="relative z-10 max-w-4xl w-full bg-[#FFF9F3] rounded-2xl overflow-hidden shadow-2xl border border-[#D29C83]/30 flex flex-col md:flex-row max-h-[90vh]"
            role="dialog"
            aria-modal="true"
            aria-label={item.title}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-[#FEEDDD]/90 text-[#411C10] hover:bg-[#F7B6A7] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3F27]"
              aria-label="Close image preview"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Image Preview Container */}
            <div className="relative md:w-3/5 bg-[#FEEDDD]/50 flex items-center justify-center overflow-hidden min-h-[300px] sm:min-h-[400px]">
              <img
                src={item.image}
                alt={item.alt || item.title}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = item.category?.includes('Brownie') || item.category?.includes('Cookie')
                    ? 'https://res.cloudinary.com/ku59ko3p/image/upload/v1792430622/PastryPaws/brownies.jpg'
                    : 'https://res.cloudinary.com/ku59ko3p/image/upload/v1792430625/PastryPaws/hero-cake.jpg';
                }}
                className="w-full h-full object-cover max-h-[55vh] md:max-h-[80vh]"
              />

              {/* Navigation Arrows */}
              {onPrev && (
                <button
                  type="button"
                  onClick={onPrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-[#FEEDDD]/80 text-[#411C10] hover:bg-[#FFF9F3] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3F27]"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              {onNext && (
                <button
                  type="button"
                  onClick={onNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-[#FEEDDD]/80 text-[#411C10] hover:bg-[#FFF9F3] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3F27]"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Content Details */}
            <div className="md:w-2/5 p-6 md:p-8 flex flex-col justify-between bg-[#FFF9F3] overflow-y-auto">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#7C3F27] font-semibold bg-[#FEE5D2] px-3 py-1 rounded-full inline-block mb-3">
                  {item.category}
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl text-[#411C10] font-normal leading-tight">
                  {item.title}
                </h3>
                <p className="mt-4 text-[#7C3F27] text-sm md:text-base leading-relaxed">
                  {item.description}
                </p>

                {/* Official Menu Pricing Details */}
                {item.pricingDetails && item.pricingDetails.length > 0 && (
                  <div className="mt-5 p-3.5 rounded-xl bg-[#FEEDDD]/70 border border-[#D29C83]/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold tracking-wider uppercase text-[#7C3F27]">
                        Menu Pricing
                      </span>
                      <span className="text-[10px] uppercase font-semibold text-[#A66D54] bg-[#FFF9F3] px-2 py-0.5 rounded-full border border-[#D29C83]/30">
                        Select portion to order
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {item.pricingDetails.map((pd) => {
                        const isSelected = selectedSize === pd.size;
                        return (
                          <button
                            key={pd.size}
                            type="button"
                            onClick={() => setSelectedSize(pd.size)}
                            className={`w-full flex items-center justify-between text-xs py-2 px-3 rounded-xl border transition-all text-left cursor-pointer ${
                              isSelected
                                ? 'bg-[#FFF9F3] border-[#7C3F27] text-[#411C10] shadow-2xs font-semibold'
                                : 'bg-[#FEEDDD]/40 border-transparent hover:bg-[#FFF9F3]/60 text-[#7C3F27]'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                  isSelected
                                    ? 'border-[#7C3F27] bg-[#7C3F27] text-[#FFF9F3]'
                                    : 'border-[#D29C83]'
                                }`}
                              >
                                {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                              </div>
                              <span className="font-medium text-[#411C10]">{pd.size}</span>
                            </div>
                            <span className="text-[#7C3F27] font-bold">{pd.price}</span>
                          </button>
                        );
                      })}
                    </div>
                    {item.category === 'Cupcakes' && (
                      <p className="text-[11px] text-[#A66D54] mt-2 italic">
                        * Small cupcake: min 10 pieces | Medium & large: min 8 pieces
                      </p>
                    )}
                  </div>
                )}

                {/* Optional Add-ons Selection */}
                {item.addons && item.addons.length > 0 && (
                  <div className="mt-4 p-3.5 rounded-xl bg-[#FEEDDD]/60 border border-[#D29C83]/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold tracking-wider uppercase text-[#7C3F27]">
                        Customize with Add-ons
                      </span>
                      <span className="text-[10px] text-[#A66D54] uppercase font-semibold">
                        Optional Extras
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {item.addons.map((addon, aIdx) => {
                        const isChecked = selectedAddons.some((a) => a.name === addon.name);
                        return (
                          <button
                            key={aIdx}
                            type="button"
                            onClick={() => {
                              if (isChecked) {
                                setSelectedAddons(selectedAddons.filter((a) => a.name !== addon.name));
                              } else {
                                setSelectedAddons([...selectedAddons, addon]);
                              }
                            }}
                            className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs border text-left transition-all cursor-pointer ${
                              isChecked
                                ? 'bg-[#FFF9F3] border-[#7C3F27] text-[#411C10] font-semibold shadow-2xs'
                                : 'bg-[#FEEDDD]/40 border-transparent hover:bg-[#FFF9F3]/60 text-[#7C3F27]'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 truncate pr-1">
                              <div
                                className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                                  isChecked
                                    ? 'bg-[#7C3F27] border-[#7C3F27] text-white'
                                    : 'border-[#D29C83]'
                                }`}
                              >
                                {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                              </div>
                              <span className="truncate">{addon.name}</span>
                            </div>
                            <span className="text-[#7C3F27] font-bold shrink-0">
                              +₹{addon.price}/-
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Quantity and Portion Total Bar */}
                <div className="mt-4 p-3 rounded-xl bg-[#FEEDDD]/40 border border-[#D29C83]/25 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#411C10]">Quantity:</span>
                    <div className="flex items-center bg-[#FFF9F3] rounded-lg border border-[#D29C83]/40 p-0.5 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-6 h-6 rounded flex items-center justify-center text-[#7C3F27] hover:bg-[#FEEDDD] transition-colors cursor-pointer"
                        title="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-7 text-center text-xs font-bold text-[#411C10]">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-6 h-6 rounded flex items-center justify-center text-[#7C3F27] hover:bg-[#FEEDDD] transition-colors cursor-pointer"
                        title="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-[#A66D54] block leading-none">Total:</span>
                    <span className="text-sm font-bold text-[#7C3F27]">₹{grandTotal}/-</span>
                  </div>
                </div>

                {item.tags && item.tags.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-[#D29C83]/20">
                    <p className="text-xs font-semibold tracking-wider uppercase text-[#A66D54] mb-2">
                      Highlights
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-[#FEEDDD] text-[#411C10] px-2.5 py-1 rounded-md border border-[#D29C83]/30"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Added to Cart Feedback Toast */}
              {addedToast && (
                <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between animate-fade-in">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    Added to your cart!
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onClose?.();
                      openCart();
                    }}
                    className="font-bold underline text-emerald-900 cursor-pointer"
                  >
                    View Cart →
                  </button>
                </div>
              )}

              {/* CTAs: Add to Cart, Buy Now, and WhatsApp */}
              <div className="mt-5 pt-4 border-t border-[#D29C83]/20 space-y-2.5">
                <div className="flex items-center gap-2">
                  {/* Add to Cart (Primary) */}
                  <button
                    type="button"
                    onClick={() => {
                      addToCart(item, selectedTier, quantity, selectedAddons);
                      setAddedToast(true);
                      setTimeout(() => setAddedToast(false), 3500);
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-[#7C3F27] text-[#FEEDDD] hover:bg-[#5E2B19] py-3 px-4 rounded-2xl text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4 text-[#F9C8B5] shrink-0" />
                    <span>Add to Cart (₹{grandTotal}/-)</span>
                  </button>

                  {/* Buy Now (Opens Checkout directly) */}
                  <button
                    type="button"
                    onClick={() => {
                      addToCart(item, selectedTier, quantity, selectedAddons);
                      onClose?.();
                      openCheckout();
                    }}
                    className="inline-flex items-center justify-center gap-1.5 bg-[#FEEDDD] text-[#7C3F27] hover:bg-[#FEE5D2] border border-[#D29C83]/50 py-3 px-3.5 rounded-2xl text-xs font-semibold tracking-wide transition-all shadow-2xs hover:shadow active:scale-[0.98] cursor-pointer"
                    title="Checkout immediately"
                  >
                    <ShoppingBag className="w-4 h-4 text-[#7C3F27]" />
                    <span className="hidden sm:inline">Buy Now</span>
                  </button>

                  {/* WhatsApp Inquiry */}
                  <a
                    href={whatsappInquiryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`Enquire about "${item.title}" on WhatsApp`}
                    className="shrink-0 w-11 h-11 rounded-2xl bg-[#25D366]/15 hover:bg-[#25D366] text-[#128C7E] hover:text-white border border-[#25D366]/35 flex items-center justify-center transition-all duration-200 shadow-2xs hover:shadow hover:scale-105 active:scale-95 cursor-pointer"
                    aria-label={`Enquire about ${item.title} on WhatsApp`}
                  >
                    <WhatsAppIcon className="w-5 h-5" />
                  </a>
                </div>

                <p className="text-[11px] text-[#A66D54] text-center">
                  Freshly baked to order • Studio pickup in Avadi or customer-arranged parcel
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
