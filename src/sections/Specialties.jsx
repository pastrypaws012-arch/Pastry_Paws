import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { SectionHeading } from '../components/SectionHeading';
import { specialtiesData as defaultOfferings } from '../data/creations';
import { StaggerContainer, StaggerItem } from '../components/Reveal';
import { ArrowUpRight } from 'lucide-react';
import { API_BASE_URL } from '../utils/api';

export function Specialties() {
  const [offerings, setOfferings] = useState(defaultOfferings);

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
          if (json.success && json.data && json.data.length > 0 && isMounted) {
            setOfferings(json.data);
          }
        }
      } catch {
        // Keeps graceful fallback
      }
    };

    fetchOfferings();
    return () => {
      isMounted = false;
    };
  }, []);

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

        <StaggerContainer
          staggerChildren={0.08}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5"
        >
          {offerings.map((spec, index) => {
            const orderLink = getOfferingOrderLink(spec);

            return (
              <StaggerItem key={spec.id || spec._id || index} className="h-full">
                <Link
                  to={orderLink}
                  className="block h-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3F27] rounded-2xl group/card"
                  aria-label={`Order ${spec.title}`}
                >
                  <motion.div
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.25 }}
                    className="relative bg-[#FFF9F3] rounded-2xl overflow-hidden border border-[#D29C83]/30 shadow-xs group-hover/card:shadow-lg group-hover/card:border-[#7C3F27]/50 flex flex-col h-full transition-all duration-300"
                  >
                    {/* Photo container with zoom & number badge */}
                    <div className="relative h-40 sm:h-44 w-full overflow-hidden bg-[#FEE5D2]">
                      <img
                        src={spec.image}
                        alt={spec.title}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src =
                            'https://res.cloudinary.com/ku59ko3p/image/upload/v1792430625/PastryPaws/hero-cake.jpg';
                        }}
                        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover/card:scale-106"
                      />
                      <div className="absolute top-2.5 left-2.5 bg-[#FEEDDD]/95 backdrop-blur-xs px-2.5 py-0.5 rounded-md text-[11px] font-serif font-semibold text-[#7C3F27] border border-[#D29C83]/40 shadow-2xs">
                        {spec.number || `0${index + 1}`}
                      </div>

                      {/* Hover Overlay Hint */}
                      <div className="absolute inset-0 bg-[#411C10]/20 opacity-0 group-hover/card:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                        <span className="bg-[#FFF9F3]/95 backdrop-blur-xs text-[#7C3F27] text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5">
                          <span>View &amp; Order</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4 sm:p-5 flex flex-col justify-between flex-grow">
                      <div>
                        {spec.subtitle && (
                          <span className="text-[10px] uppercase tracking-wider font-semibold text-[#A66D54] block mb-1">
                            {spec.subtitle}
                          </span>
                        )}
                        <h3 className="font-serif text-lg sm:text-xl text-[#411C10] font-normal group-hover/card:text-[#7C3F27] transition-colors leading-snug">
                          {spec.title}
                        </h3>
                        {spec.description && (
                          <p className="mt-1.5 text-xs text-[#7C3F27] leading-relaxed font-normal line-clamp-3">
                            {spec.description}
                          </p>
                        )}
                      </div>

                      {/* Bottom Pricing & Order Action */}
                      <div className="mt-4 pt-3 border-t border-[#D29C83]/20 flex items-center justify-between gap-2">
                        <div>
                          {spec.accent && (
                            <span className="text-[10px] font-medium text-[#7C3F27] bg-[#FEEDDD] px-2 py-0.5 rounded-full inline-block truncate max-w-[120px]">
                              {spec.accent}
                            </span>
                          )}
                          {spec.price && (
                            <p className="text-xs font-bold text-[#411C10] mt-0.5">
                              {spec.price}
                            </p>
                          )}
                        </div>
                        <div
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#FEEDDD] text-[#7C3F27] group-hover/card:bg-[#7C3F27] group-hover/card:text-[#FEEDDD] text-xs font-semibold transition-all duration-200 shadow-2xs shrink-0"
                        >
                          <span>Order</span>
                          <ArrowUpRight className="w-3.5 h-3.5 group-hover/card:translate-x-0.5 group-hover/card:-translate-y-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
