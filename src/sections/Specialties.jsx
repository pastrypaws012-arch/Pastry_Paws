import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SectionHeading } from '../components/SectionHeading';
import { ArrowUpRight, ShoppingBag, Sparkles, Expand } from 'lucide-react';
import { brandConfig } from '../data/brand';
import { API_BASE_URL } from '../utils/api';

export function Specialties() {
  const [offerings, setOfferings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper to map each offering directly to its menu/order page category
  const getOfferingOrderLink = (spec) => {
    if (spec.link && spec.link.startsWith('/')) {
      return spec.link;
    }
    const t = (spec.title || '').toLowerCase();
    if (t.includes('cake') && !t.includes('lava') && !t.includes('cupcake')) {
      return '/menu?category=Cakes';
    }
    if (t.includes('brownie')) {
      return '/menu?category=Brownies';
    }
    if (t.includes('lava') || t.includes('cupcake')) {
      return '/menu?category=Choco%20Lava%20Cake';
    }
    if (t.includes('cookie') || t.includes('tea cake')) {
      return '/menu?category=Cookies';
    }
    if (t.includes('bowl')) {
      return '/menu?category=Chocolate%20Bowls';
    }
    return '/menu';
  };

  // Fetch live offerings dynamically from MongoDB Atlas
  useEffect(() => {
    let isMounted = true;
    const fetchOfferings = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/offerings`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && isMounted) {
            setOfferings(json.data);
          }
        }
      } catch {
        if (isMounted) setOfferings([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchOfferings();
    return () => {
      isMounted = false;
    };
  }, []);

  // Only show offerings when loaded and at least one exists
  if (loading || offerings.length === 0) {
    return null;
  }

  return (
    <section
      id="specialties"
      className="py-12 md:py-16 bg-[#FDEADA] relative"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <SectionHeading
          eyebrow="OUR OFFERINGS"
          accentScript="Crafted with Passion"
          title="Something special for every occasion"
          subtitle="Every recipe is balanced to order, celebrating natural flavors, textures, and bespoke visual styling. Click any offering to view & order."
          align="center"
          className="mb-8 md:mb-10"
        />

        <div
          className={`grid grid-cols-1 ${
            offerings.length === 1
              ? 'sm:grid-cols-1 max-w-sm mx-auto'
              : offerings.length === 2
              ? 'sm:grid-cols-2 max-w-2xl mx-auto'
              : offerings.length === 3
              ? 'sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto'
              : 'sm:grid-cols-2 lg:grid-cols-4'
          } gap-4 sm:gap-5`}
        >
          {offerings.map((spec, index) => {
            const orderLink = getOfferingOrderLink(spec);

            return (
              <div
                key={spec.id || spec._id || index}
                className="group relative bg-[#FFF9F3] rounded-2xl overflow-hidden border border-[#D29C83]/30 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between h-full hover:-translate-y-1"
              >
                <Link
                  to={orderLink}
                  className="block cursor-pointer focus:outline-none group/link"
                  aria-label={`Order ${spec.title}`}
                >
                  {/* Photo Container: Matches exact MenuCard fancy aesthetic while maintaining offering card size */}
                  <div className="relative h-40 sm:h-44 w-full overflow-hidden bg-[#FEE5D2]/50">
                    <img
                      src={spec.image}
                      alt={spec.title}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src =
                          'https://res.cloudinary.com/ku59ko3p/image/upload/v1792430625/PastryPaws/hero-cake.jpg';
                      }}
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover/link:scale-106"
                    />

                    {/* Hover Overlay Hint with Glassmorphism */}
                    <div className="absolute inset-0 bg-[#411C10]/30 opacity-0 group-hover/link:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <span className="bg-[#FFF9F3]/90 text-[#411C10] text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm backdrop-blur-xs">
                        <Expand className="w-3.5 h-3.5" />
                        <span>View &amp; Order</span>
                      </span>
                    </div>

                    {/* Top Left: Badges (Number + Accent/Pill) */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-serif font-bold px-2 py-0.5 rounded-full bg-[#FEEDDD]/95 text-[#7C3F27] border border-[#D29C83]/40 backdrop-blur-xs shadow-2xs">
                        {spec.number || `0${index + 1}`}
                      </span>
                      {spec.accent && (
                        <span className="text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-[#7C3F27] text-[#FFF9F3] shadow-2xs">
                          {spec.accent}
                        </span>
                      )}
                    </div>

                    {/* Top Right: Prominent Price Badge (like MenuCard) */}
                    {spec.price && (
                      <div className="absolute top-2.5 right-2.5">
                        <span className="text-[11px] font-bold text-[#7C3F27] bg-[#FFF9F3]/95 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-[#D29C83]/40 shadow-2xs whitespace-nowrap">
                          {spec.price.toLowerCase().includes('₹') || spec.price.toLowerCase().includes('from')
                            ? spec.price
                            : `From ₹${spec.price}`}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-3.5 sm:p-4">
                    {spec.subtitle && (
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-[#A66D54] block mb-1">
                        {spec.subtitle}
                      </span>
                    )}
                    <h3 className="font-serif text-base sm:text-lg text-[#411C10] font-normal leading-snug group-hover/link:text-[#7C3F27] transition-colors line-clamp-1">
                      {spec.title}
                    </h3>
                    {spec.description && (
                      <p className="mt-1.5 text-xs text-[#7C3F27]/90 leading-relaxed font-normal line-clamp-2">
                        {spec.description}
                      </p>
                    )}

                    {/* Specialty Quality Micro-Tag */}
                    <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-[#A66D54]">
                      <Sparkles className="w-3 h-3 text-[#E29578] shrink-0" />
                      <span className="truncate">Freshly baked to order • 100% Eggless</span>
                    </div>
                  </div>
                </Link>

                {/* Fancy Action Footer: Primary "Order Now" Button */}
                <div className="p-3.5 sm:p-4 pt-0">
                  <div className="pt-2.5 border-t border-[#D29C83]/20">
                    <Link
                      to={orderLink}
                      className="w-full inline-flex items-center justify-center gap-1.5 bg-[#7C3F27] text-[#FEEDDD] hover:bg-[#5E2B19] py-2 px-3 rounded-xl text-xs font-semibold tracking-wide transition-all shadow-2xs hover:shadow active:scale-[0.98]"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-[#F9C8B5] shrink-0" />
                      <span>Order Now</span>
                      <ArrowUpRight className="w-3 h-3 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

