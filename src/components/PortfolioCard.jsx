import React from 'react';
import { motion } from 'motion/react';
import { Expand, Sparkles } from 'lucide-react';

export function PortfolioCard({ item, onClick, priority = false }) {
  return (
    <motion.div
      onClick={onClick}
      className="group relative cursor-pointer overflow-hidden rounded-2xl bg-[#FFF9F3] border border-[#D29C83]/30 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col h-full w-[210px] sm:w-[225px] md:w-[240px] shrink-0 snap-start select-none"
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
    >
      {/* Compact Square Image Container */}
      <div className="relative overflow-hidden w-full aspect-square bg-[#FEE5D2]/40 rounded-t-2xl">
        <img
          src={item.image}
          alt={item.alt || item.title}
          loading={priority ? 'eager' : 'lazy'}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = item.category?.includes('Brownie') || item.category?.includes('Cookie')
              ? '/images/brownies.jpg'
              : '/images/hero-cake.jpg';
          }}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-106"
        />

        {/* Hover quick overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#411C10]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-between p-3">
          <span className="text-[10px] uppercase tracking-wider text-[#FFF9F3] font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#F7B6A7]" />
            View
          </span>
          <div className="p-1 rounded-full bg-[#FFF9F3]/30 text-[#FFF9F3]">
            <Expand className="w-3 h-3" />
          </div>
        </div>

        {/* Category Pill Tag */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-[#FEEDDD]/95 text-[#7C3F27] border border-[#D29C83]/30 backdrop-blur-xs shadow-2xs">
            {item.category}
          </span>
          {item.badge && (
            <span className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-full bg-[#7C3F27] text-[#FFF9F3] shadow-2xs">
              {item.badge}
            </span>
          )}
        </div>
      </div>

      {/* Card Information */}
      <div className="p-3.5 flex flex-col justify-between flex-grow bg-[#FFF9F3]">
        <div>
          <h3 className="font-serif text-base sm:text-lg text-[#411C10] font-normal group-hover:text-[#7C3F27] transition-colors leading-snug line-clamp-1">
            {item.title}
          </h3>

          {/* Pricing Highlight */}
          <div className="mt-1 flex items-baseline gap-1">
            <span className="font-sans font-bold text-sm text-[#7C3F27]">
              {item.priceDisplay ? item.priceDisplay.split('•')[0].trim() : `₹${item.startingPrice}/-`}
            </span>
            {item.priceDisplay && item.priceDisplay.includes('•') && (
              <span className="text-[10px] text-[#A66D54]">
                • {item.priceDisplay.split('•')[1].trim()}
              </span>
            )}
          </div>

          <p className="mt-1.5 text-xs text-[#7C3F27]/90 line-clamp-2 leading-relaxed font-normal">
            {item.description}
          </p>
        </div>

        {/* Bottom Tag / Note */}
        {item.tags && item.tags.length > 0 && (
          <div className="mt-2.5 pt-2 border-t border-[#D29C83]/20 flex items-center justify-between text-[10px] text-[#A66D54]">
            <span className="truncate">{item.tags[0]}</span>
            <span className="text-[#7C3F27] font-medium shrink-0">Details &rarr;</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
