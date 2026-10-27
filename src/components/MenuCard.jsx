import React from 'react';
import { motion } from 'motion/react';
import { Expand, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

/**
 * MenuCard
 * Rich, clean product card tailored for the dedicated Menu Page.
 * Displays:
 * 1. Image with zoom & lightbox trigger + optional In-Cart ribbon
 * 2. Title and Starting Price
 * 3. Short description
 * 4. Clean "Order Now" button triggering customization modal
 */
export function MenuCard({ item, onOpenLightbox, onOrderNow, priority = false }) {
  const { getItemQuantity } = useCart();
  const cartQuantity = getItemQuantity(item);

  const defaultTier = item.pricingDetails?.[0] || {
    size: 'Standard',
    price: item.startingPrice ? `₹${item.startingPrice}/-` : '₹299/-',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="group relative bg-[#FFF9F3] rounded-2xl overflow-hidden border border-[#D29C83]/30 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between h-full"
    >
      <div>
        {/* Image Container with Lightbox click */}
        <div
          onClick={onOpenLightbox}
          className="relative aspect-4/3 w-full overflow-hidden bg-[#FEE5D2]/50 cursor-pointer"
        >
          <img
            src={item.image}
            alt={item.alt || item.title}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = item.category?.includes('Brownie') || item.category?.includes('Cookie')
                ? 'https://res.cloudinary.com/ku59ko3p/image/upload/v1792430622/PastryPaws/brownies.jpg'
                : 'https://res.cloudinary.com/ku59ko3p/image/upload/v1792430625/PastryPaws/hero-cake.jpg';
            }}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-106"
          />

          {/* Quick overlay badge */}
          <div className="absolute inset-0 bg-[#411C10]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <span className="bg-[#FFF9F3]/90 text-[#411C10] text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm backdrop-blur-xs">
              <Expand className="w-3.5 h-3.5" />
              <span>Customize &amp; Order</span>
            </span>
          </div>

          {/* Category & Special Badge */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full bg-[#FEEDDD]/95 text-[#7C3F27] border border-[#D29C83]/40 backdrop-blur-xs shadow-2xs">
              {item.category}
            </span>
            {item.badge && (
              <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full bg-[#7C3F27] text-[#FFF9F3] shadow-2xs">
                {item.badge}
              </span>
            )}
          </div>

          {/* In Cart Indicator Ribbon */}
          {cartQuantity > 0 && (
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-700 text-white shadow-xs">
                <span>In Cart ({cartQuantity})</span>
              </span>
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="p-4 sm:p-5">
          {/* Title & Starting Price */}
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-serif text-lg sm:text-xl text-[#411C10] font-normal leading-snug group-hover:text-[#7C3F27] transition-colors">
              {item.title}
            </h3>
            {item.startingPrice && (
              <span className="shrink-0 text-xs sm:text-sm font-bold text-[#7C3F27] bg-[#FEEDDD] px-2.5 py-1 rounded-xl border border-[#D29C83]/35 whitespace-nowrap shadow-2xs">
                From ₹{item.startingPrice}/-
              </span>
            )}
          </div>

          {/* Description */}
          <p className="mt-2.5 text-xs text-[#7C3F27]/85 leading-relaxed font-normal">
            {item.description}
          </p>
        </div>
      </div>

      {/* Card Action Footer: Clean Order Now Button */}
      <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-1">
        <button
          type="button"
          onClick={() => (onOpenLightbox ? onOpenLightbox(item) : onOrderNow?.(item, defaultTier))}
          className="w-full inline-flex items-center justify-center gap-2 bg-[#7C3F27] text-[#FEEDDD] hover:bg-[#5E2B19] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-2xs hover:shadow active:scale-[0.98] cursor-pointer"
        >
          <ShoppingBag className="w-4 h-4 text-[#F9C8B5] shrink-0" />
          <span>{cartQuantity > 0 ? 'Add More / Customize' : 'Order Now'}</span>
        </button>
      </div>
    </motion.div>
  );
}
