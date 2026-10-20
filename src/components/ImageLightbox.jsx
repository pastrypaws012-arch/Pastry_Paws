import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, MessageCircle, ShoppingBag, Check } from 'lucide-react';
import { WhatsAppIcon } from './Icons';
import { brandConfig } from '../data/brand';

export function ImageLightbox({
  isOpen,
  item,
  items = [],
  onClose,
  onPrev,
  onNext,
  onOrderNow,
}) {
  const [selectedSize, setSelectedSize] = useState('');

  useEffect(() => {
    if (item?.pricingDetails && item.pricingDetails.length > 0) {
      setSelectedSize(item.pricingDetails[0].size);
    } else {
      setSelectedSize('');
    }
  }, [item]);

  const selectedTier =
    item?.pricingDetails?.find((p) => p.size === selectedSize) ||
    item?.pricingDetails?.[0] || {
      size: 'Standard',
      price: item?.startingPrice ? `₹${item.startingPrice}/-` : '₹299/-',
    };
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
                    {item.category === 'Brownie' && (
                      <p className="text-[11px] text-[#A66D54] mt-2 italic">
                        * Extra chocolate add-on: +₹30/-
                      </p>
                    )}
                  </div>
                )}

                {item.tags && item.tags.length > 0 && (
                  <div className="mt-5 pt-4 border-t border-[#D29C83]/20">
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

              {/* Order Now & WhatsApp Inquiry CTAs */}
              <div className="mt-6 pt-5 border-t border-[#D29C83]/20 space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      onOrderNow?.(item, selectedTier);
                      onClose?.();
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-[#7C3F27] text-[#FEEDDD] hover:bg-[#5E2B19] py-3 px-5 rounded-2xl text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4 text-[#F9C8B5] shrink-0" />
                    <span>Order Now ({selectedTier.price})</span>
                  </button>

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
                  Freshly baked to order • Free local studio pickup or doorstep delivery
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
