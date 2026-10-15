import React from 'react';
import { motion } from 'motion/react';
import { SectionHeading } from '../components/SectionHeading';
import { socialGalleryData } from '../data/socialGallery';
import { brandConfig } from '../data/brand';
import { Heart } from 'lucide-react';
import { InstagramIcon } from '../components/Icons';
import { StaggerContainer, StaggerItem, Reveal } from '../components/Reveal';

export function InstagramGallery() {
  return (
    <section
      id="moments"
      className="py-20 md:py-28 bg-[#FDEADA] relative"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <SectionHeading
          eyebrow="BEHIND THE SCENES"
          accentScript="Daily Delights"
          title="Little moments from our kitchen"
          subtitle="Follow along for freshly baked batches, seasonal previews, and quiet mornings at the bench."
          align="center"
        />

        <StaggerContainer
          staggerChildren={0.08}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-5"
        >
          {socialGalleryData.map((item) => (
            <StaggerItem key={item.id}>
              <a
                href={brandConfig.contact.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block aspect-square rounded-xl overflow-hidden bg-[#FEEDDD] border border-[#D29C83]/30 shadow-xs hover:shadow-md transition-all duration-300"
                aria-label={item.caption}
              >
                <img
                  src={item.image}
                  alt={item.caption}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
                />

                {/* Subtle hover overlay */}
                <div className="absolute inset-0 bg-[#411C10]/65 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3.5 text-[#FFF9F3]">
                  <div className="flex justify-end">
                    <InstagramIcon className="w-4 h-4 text-[#F7B6A7]" />
                  </div>
                  <div>
                    <p className="text-[11px] line-clamp-2 leading-tight font-sans">
                      {item.caption}
                    </p>
                    <div className="flex items-center gap-1 mt-1.5 text-[10px] text-[#F9C8B5]">
                      <Heart className="w-3 h-3 fill-current" />
                      <span>{item.likes}</span>
                    </div>
                  </div>
                </div>
              </a>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <Reveal delay={0.3} duration={0.6}>
          <div className="mt-10 sm:mt-12 text-center">
            <a
              href={brandConfig.contact.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#FFF9F3] border border-[#D29C83] text-[#7C3F27] px-6 py-3 rounded-full text-sm font-medium hover:bg-[#7C3F27] hover:text-[#FEEDDD] transition-all shadow-xs"
            >
              <InstagramIcon className="w-4 h-4 text-[#F7B6A7]" />
              <span>Follow {brandConfig.contact.instagramHandle}</span>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
