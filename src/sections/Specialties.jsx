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
      className="py-20 md:py-28 bg-[#FDEADA] relative"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <SectionHeading
          eyebrow="OUR OFFERINGS"
          title="Something special for every occasion"
          subtitle="Every recipe is balanced to order, celebrating natural flavors, textures, and bespoke visual styling."
          align="center"
        />

        <StaggerContainer
          staggerChildren={0.12}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
        >
          {specialtiesData.map((spec) => (
            <StaggerItem key={spec.id} className="h-full">
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ duration: 0.3 }}
                className="group relative bg-[#FFF9F3] rounded-2xl overflow-hidden border border-[#D29C83]/30 shadow-xs hover:shadow-md flex flex-col h-full"
              >
                {/* Photo container with zoom */}
                <div className="relative aspect-4/3 w-full overflow-hidden bg-[#FEE5D2]">
                  <img
                    src={spec.image}
                    alt={spec.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                  />
                  <div className="absolute top-3 left-3 bg-[#FEEDDD]/90 backdrop-blur-xs px-2.5 py-1 rounded-md text-xs font-serif font-semibold text-[#7C3F27] border border-[#D29C83]/40">
                    {spec.number}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 flex flex-col justify-between flex-grow">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-[#A66D54] block mb-1">
                      {spec.subtitle}
                    </span>
                    <h3 className="font-serif text-2xl text-[#411C10] font-normal group-hover:text-[#7C3F27] transition-colors">
                      {spec.title}
                    </h3>
                    <p className="mt-3 text-xs sm:text-sm text-[#7C3F27] leading-relaxed font-normal">
                      {spec.description}
                    </p>
                  </div>

                  {/* Bottom Accent */}
                  <div className="mt-6 pt-4 border-t border-[#D29C83]/20 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-medium text-[#7C3F27] bg-[#FEEDDD] px-2.5 py-1 rounded-full inline-block">
                        {spec.accent}
                      </span>
                      {spec.price && (
                        <p className="text-xs font-bold text-[#411C10] mt-1.5">
                          {spec.price}
                        </p>
                      )}
                    </div>
                    <a
                      href="#contact"
                      className="p-1.5 rounded-full bg-[#FEEDDD] text-[#411C10] group-hover:bg-[#7C3F27] group-hover:text-[#FEEDDD] transition-colors"
                      aria-label={`Inquire about ${spec.title}`}
                    >
                      <ArrowUpRight className="w-4 h-4" />
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
