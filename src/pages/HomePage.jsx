import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Cake, Sparkles } from 'lucide-react';
import { Hero } from '../sections/Hero';
import { OurStory } from '../sections/OurStory';
import { Specialties } from '../sections/Specialties';
import { Testimonials } from '../sections/Testimonials';
import { InstagramGallery } from '../sections/InstagramGallery';
import { Contact } from '../sections/Contact';

export function HomePage() {
  return (
    <>
      <Hero />

      {/* Menu Teaser Banner: Inviting visitors to the dedicated Menu Page */}
      <section className="bg-[#FDEADA] py-6 sm:py-8 border-y border-[#D29C83]/30">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#FFF9F3] p-4 sm:p-6 rounded-2xl border border-[#D29C83]/30 shadow-xs">
            <div className="flex items-center gap-3.5 text-left">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#FEEDDD] border border-[#D29C83]/40 flex items-center justify-center text-[#7C3F27] shrink-0">
                <Cake className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h3 className="font-serif text-lg sm:text-xl text-[#411C10] font-normal leading-tight">
                  Craving freshly baked happiness?
                </h3>
                <p className="text-xs sm:text-sm text-[#7C3F27] mt-0.5">
                  Browse our full menu with exact prices, weights, and direct WhatsApp ordering.
                </p>
              </div>
            </div>

            <Link
              to="/menu"
              className="inline-flex items-center gap-2 bg-[#7C3F27] text-[#FEEDDD] hover:bg-[#5E2B19] px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium tracking-wide transition-all shadow-xs shrink-0"
            >
              <span>Explore Full Menu</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <OurStory />
      <Specialties />
      <Testimonials />
      <InstagramGallery />
      <Contact />
    </>
  );
}
