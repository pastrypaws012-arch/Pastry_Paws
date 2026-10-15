import React from 'react';
import { motion } from 'motion/react';
import { SectionHeading } from '../components/SectionHeading';
import { specialtiesData } from '../data/creations';
import { Reveal, StaggerContainer, StaggerItem } from '../components/Reveal';
import { ArrowUpRight } from 'lucide-react';

export function Specialties() {
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
          {specialtiesData.map((spec) => (
            <StaggerItem key={spec.id} className="h-full">
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
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-106"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-[#FEEDDD]/90 backdrop-blur-xs px-2 py-0.5 rounded text-[11px] font-serif font-semibold text-[#7C3F27] border border-[#D29C83]/40">
                    {spec.number}
                  </div>
                </div>

                {/* Compact Card Content */}
                <div className="p-4 sm:p-4.5 flex flex-col justify-between flex-grow">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-[#A66D54] block mb-0.5">
                      {spec.subtitle}
                    </span>
                    <h3 className="font-serif text-lg sm:text-xl text-[#411C10] font-normal group-hover:text-[#7C3F27] transition-colors leading-snug">
                      {spec.title}
                    </h3>
                    <p className="mt-1.5 text-xs text-[#7C3F27] leading-relaxed font-normal line-clamp-3">
                      {spec.description}
                    </p>
                  </div>

                  {/* Bottom Accent */}
                  <div className="mt-4 pt-3 border-t border-[#D29C83]/20 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-medium text-[#7C3F27] bg-[#FEEDDD] px-2 py-0.5 rounded-full inline-block">
                        {spec.accent}
                      </span>
                      {spec.price && (
                        <p className="text-[11px] font-bold text-[#411C10] mt-1">
                          {spec.price}
                        </p>
                      )}
                    </div>
                    <a
                      href="#contact"
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
