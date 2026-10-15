import React from 'react';
import { SectionHeading } from '../components/SectionHeading';
import { TestimonialCard } from '../components/TestimonialCard';
import { testimonialsData } from '../data/testimonials';
import { StaggerContainer, StaggerItem, Reveal } from '../components/Reveal';

export function Testimonials() {
  return (
    <section
      id="testimonials"
      className="py-20 md:py-28 bg-[#FEEDDD] relative overflow-hidden"
    >
      {/* Subtle background ambient blob */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#F7B6A7]/10 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 relative z-10">
        <SectionHeading
          eyebrow="CLIENT EXPERIENCES"
          accentScript="From the Heart"
          title="Kind words from our customers"
          subtitle="Nothing warms our kitchen more than hearing how our creations added magic to your gatherings."
          align="center"
        />

        <StaggerContainer
          staggerChildren={0.12}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8"
        >
          {testimonialsData.map((item, index) => (
            <StaggerItem key={item.id} className="h-full">
              <TestimonialCard
                testimonial={item}
                isFeatured={index === 0}
              />
            </StaggerItem>
          ))}
        </StaggerContainer>

        <Reveal delay={0.4} duration={0.6}>
          <div className="mt-12 text-center">
            <p className="text-xs text-[#A66D54] tracking-wide">
              Shared by real patrons • Bespoke orders for intimate gatherings and grand celebrations
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
