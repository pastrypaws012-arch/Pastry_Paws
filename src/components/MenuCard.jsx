import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Expand, Check, ShoppingBag, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';

/**
 * MenuCard
 * Rich product card tailored for the dedicated Menu Page.
 * Displays:
 * 1. Image with zoom & lightbox trigger
 * 2. Title, category, starting price
 * 3. Exact price-by-weight breakdown table (250gm, 500gm, 1kg, etc.)
 * 4. Interactive Cart Quantity modifier or Primary "Order Now" button
 */
export function MenuCard({ item, onOpenLightbox, onOrderNow, priority = false }) {
  const { getItemQuantity, incrementItem, decrementItem } = useCart();
  const cartQuantity = getItemQuantity(item);

  const [selectedSize, setSelectedSize] = useState(
    item.pricingDetails && item.pricingDetails.length > 0
      ? item.pricingDetails[0].size
      : ''
  );

  const selectedTier = item.pricingDetails?.find((p) => p.size === selectedSize) || item.pricingDetails?.[0];

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
              <span>View Photo</span>
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
            <span className="shrink-0 text-xs font-bold text-[#7C3F27] bg-[#FEEDDD] px-2 py-1 rounded-md border border-[#D29C83]/30 whitespace-nowrap">
              From ₹{item.startingPrice}
            </span>
          </div>

          {/* Description */}
          <p className="mt-2 text-xs text-[#7C3F27]/90 leading-relaxed font-normal">
            {item.description}
          </p>

          {/* Price-by-Weight Breakdown Table */}
          {item.pricingDetails && item.pricingDetails.length > 0 && (
            <div className="mt-4 pt-3 border-t border-[#D29C83]/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-[#A66D54]">
                  Price by Size / Weight
                </span>
                <span className="text-[10px] text-[#7C3F27]">Select to order</span>
              </div>

              {/* Weight Selector / Table */}
              <div className="grid grid-cols-1 gap-1.5 bg-[#FEEDDD]/50 p-2 rounded-xl border border-[#D29C83]/25">
                {item.pricingDetails.map((tier, idx) => {
                  const isSelected = selectedSize === tier.size;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedSize(tier.size)}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all duration-150 text-left ${
                        isSelected
                          ? 'bg-[#FFF9F3] border border-[#7C3F27] text-[#411C10] shadow-2xs font-semibold'
                          : 'hover:bg-[#FFF9F3]/80 text-[#7C3F27] border border-transparent font-normal'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <div
                          className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? 'border-[#7C3F27] bg-[#7C3F27] text-[#FFF9F3]'
                              : 'border-[#D29C83]'
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                        <span>{tier.size}</span>
                      </div>
                      <span className="font-bold text-[#7C3F27]">{tier.price}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card Action Footer: Quantity Selector (if in cart) OR Order Now Button */}
      <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0">
        {cartQuantity > 0 ? (
          <div className="w-full flex items-center justify-between bg-[#FEEDDD] p-1.5 rounded-xl border border-[#D29C83]/50 shadow-2xs">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                decrementItem(item);
              }}
              className="w-8 h-8 rounded-lg bg-[#FFF9F3] text-[#7C3F27] hover:bg-[#FEE5D2] flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
              aria-label={`Decrease quantity of ${item.title}`}
              title="Decrease quantity"
            >
              <Minus className="w-4 h-4 stroke-[2.5]" />
            </button>

            <div className="flex items-center gap-1.5 text-xs font-bold text-[#411C10]">
              <span className="text-[11px] text-[#A66D54] uppercase tracking-wider font-semibold">In Cart:</span>
              <span className="w-6 text-center font-extrabold text-[#7C3F27] text-sm">{cartQuantity}</span>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                incrementItem(item, selectedTier);
              }}
              className="w-8 h-8 rounded-lg bg-[#7C3F27] text-[#FEEDDD] hover:bg-[#5E2B19] flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
              aria-label={`Increase quantity of ${item.title}`}
              title="Increase quantity"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => (onOpenLightbox ? onOpenLightbox(item) : onOrderNow?.(item, selectedTier))}
            className="w-full inline-flex items-center justify-center gap-2 bg-[#7C3F27] text-[#FEEDDD] hover:bg-[#5E2B19] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-2xs hover:shadow active:scale-[0.98] cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-[#F9C8B5] shrink-0" />
            <span>Order Now</span>
          </button>
        )}
      </div>
    </motion.div>
  );
}
