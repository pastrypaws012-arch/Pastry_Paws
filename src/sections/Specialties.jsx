import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { SectionHeading } from '../components/SectionHeading';
import { specialtiesData as defaultOfferings } from '../data/creations';
import { Reveal, StaggerContainer, StaggerItem } from '../components/Reveal';
import { ArrowUpRight } from 'lucide-react';
import { API_BASE_URL } from '../utils/api';

export function Specialties() {
  const [offerings, setOfferings] = useState(defaultOfferings);

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
          subtitle="Every recipe is balanced to order, celebrating natural flavors, textures, and bespoke visual styling."
          align="center"
          className="mb-8 md:mb-10"
        />

        <StaggerContainer
          staggerChildren={0.08}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5"
        >
          {offerings.map((spec, index) => (
            <StaggerItem key={spec.id || spec._id || index} className="h-full">
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.25 }}
                className="group relative bg-[#FFF9F3] rounded-xl overflow-hidden border border-[#D29C83]/30 shadow-xs hover:shadow-md flex flex-col h-full"
              >
                {/* Compact Photo container with zoom */}
                <div className="relative h-36 sm:h-40 w-full overflow-hidden bg-[#FEE5D2]">
                  <img
                    src={spec.image}
                    alt={spec.title}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://res.cloudinary.com/ku59ko3p/image/upload/v1792430625/PastryPaws/hero-cake.jpg';
                    }}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-106"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-[#FEEDDD]/90 backdrop-blur-xs px-2 py-0.5 rounded text-[11px] font-serif font-semibold text-[#7C3F27] border border-[#D29C83]/40">
                    {spec.number || `0${index + 1}`}
                  </div>
                </div>

                {/* Compact Card Content */}
                <div className="p-4 sm:p-4.5 flex flex-col justify-between flex-grow">
                  <div>
                    {spec.subtitle && (
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-[#A66D54] block mb-0.5">
                        {spec.subtitle}
                      </span>
                    )}
                    <h3 className="font-serif text-lg sm:text-xl text-[#411C10] font-normal group-hover:text-[#7C3F27] transition-colors leading-snug">
                      {spec.title}
                    </h3>
                    {spec.description && (
                      <p className="mt-1.5 text-xs text-[#7C3F27] leading-relaxed font-normal line-clamp-3">
                        {spec.description}
                      </p>
                    )}
                  </div>

                  {/* Bottom Accent */}
                  <div className="mt-4 pt-3 border-t border-[#D29C83]/20 flex items-center justify-between">
                    <div>
                      {spec.accent && (
                        <span className="text-[10px] font-medium text-[#7C3F27] bg-[#FEEDDD] px-2 py-0.5 rounded-full inline-block">
                          {spec.accent}
                        </span>
                      )}
                      {spec.price && (
                        <p className="text-[11px] font-bold text-[#411C10] mt-1">
                          {spec.price}
                        </p>
                      )}
                    </div>
                    <a
                      href={spec.link || '#contact'}
                      className="p-1.5 rounded-full bg-[#FEEDDD] text-[#411C10] group-hover:bg-[#7C3F27] group-hover:text-[#FEEDDD] transition-colors"
                      aria-label={`Inquire about ${spec.title}`}
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
