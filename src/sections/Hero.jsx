import React from 'react';
import { motion } from 'motion/react';
import { ArrowDown, Sparkles, Heart } from 'lucide-react';
import { brandConfig } from '../data/brand';
import { Button } from '../components/Button';
import { AnimatedScriptWord } from '../components/AnimatedUnderline';
import { useReducedMotionPreference } from '../hooks/useReducedMotionPreference';

export function Hero() {
  const prefersReducedMotion = useReducedMotionPreference();

  return (
    <section
      id="hero"
      className="relative min-h-[85vh] lg:min-h-[90vh] flex items-center justify-center pt-10 pb-14 md:pt-14 md:pb-20 overflow-hidden bg-[#FEEDDD]"
    >
      {/* Delicate background aura and vintage line detail */}
      <div className="absolute top-1/4 right-5 w-72 h-72 rounded-full bg-[#FEE5D2]/70 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-[#F7B6A7]/15 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Text & Editorial Branding */}
          <div className="lg:col-span-6 xl:col-span-6 flex flex-col justify-center text-left z-10">
            {/* Eyebrow Label */}
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="inline-flex items-center gap-2 mb-4"
            >
              <span className="w-8 h-px bg-[#D29C83]" />
              <span className="text-xs sm:text-sm tracking-[0.25em] uppercase font-semibold text-[#7C3F27]">
                {brandConfig.eyebrow}
              </span>
              <Heart className="w-3.5 h-3.5 text-[#F7B6A7] fill-current" />
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="font-serif text-4xl sm:text-5xl md:text-6xl xl:text-[4rem] text-[#411C10] font-normal leading-[1.08] tracking-tight"
            >
              Sweet treats for{' '}
              <AnimatedScriptWord
                underlineColor="#F7B6A7"
                delay={0.7}
                className="font-script text-5xl sm:text-6xl md:text-7xl text-[#7C3F27] block sm:inline font-normal"
              >
                every mood.
              </AnimatedScriptWord>
            </motion.h1>

            {/* Supporting Copy */}
            <motion.p
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="mt-5 text-base sm:text-lg text-[#7C3F27] leading-relaxed max-w-lg font-normal"
            >
              Cakes, pastries, fudgy brownies, cupcakes, and gooey choco lava baked with love by Pastry Paws. Handcrafted fresh to order for every sweet moment!
            </motion.p>

            {/* Call to Actions */}
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.55 }}
              className="mt-8 sm:mt-10 flex flex-wrap items-center gap-4"
            >
              <Button href="/menu" variant="primary" icon>
                Explore Menu
              </Button>
              <Button href="#story" variant="secondary">
                Our Story
              </Button>
            </motion.div>

            {/* Small reassurance badge */}
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="mt-10 pt-6 border-t border-[#D29C83]/30 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-[#A66D54]"
            >
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7C3F27]" />
                <span>100% Handcrafted</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7C3F27]" />
                <span>Freshly baked to order</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7C3F27]" />
                <span>Cakes from ₹399</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Hero Cake Artwork with Editorial Mask */}
          <div className="lg:col-span-6 xl:col-span-6 relative flex justify-center lg:justify-end">
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.94, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-[340px] sm:max-w-[420px] lg:max-w-[460px]"
            >
              {/* Decorative vintage frame backdrop */}
              <div className="absolute -inset-2.5 sm:-inset-3 rounded-3xl border border-[#D29C83]/40 -rotate-1 pointer-events-none" />
              <div className="absolute -inset-2.5 sm:-inset-3 rounded-3xl bg-[#FEE5D2]/50 rotate-1 -z-10" />

              {/* Main Image Container */}
              <div className="relative rounded-2xl overflow-hidden shadow-lg h-[340px] sm:h-[390px] lg:h-[430px] w-full bg-[#FDEADA]">
                <img
                  src="/images/hero-ribbon-cake.jpg"
                  onError={(e) => { e.currentTarget.src = '/images/hero-cake.jpg'; }}
                  alt="Artisanal vintage ribbon celebration cake by Pastry Paws"
                  loading="eager"
                  className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105"
                />

                {/* Floating pill badge */}
                <motion.div
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  className="absolute bottom-3 left-3 right-3 bg-[#FFF9F3]/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-[#D29C83]/40 shadow-xs flex items-center gap-2.5"
                >
                  <div className="p-1.5 rounded-full bg-[#FEEDDD] text-[#7C3F27]">
                    <Sparkles className="w-3.5 h-3.5 text-[#7C3F27]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-[#411C10] uppercase tracking-wider">
                      Signature Creation
                    </p>
                    <p className="font-serif text-xs sm:text-sm text-[#7C3F27] italic">
                      Vintage Ribbon Cake &amp; Silk Bows
                    </p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-6 md:mt-8 flex justify-center"
        >
          <a
            href="#creations"
            className="flex flex-col items-center text-xs tracking-widest text-[#7C3F27] hover:text-[#411C10] transition-colors gap-2 group"
            aria-label="Scroll to creations"
          >
            <span className="uppercase text-[11px] font-medium">Scroll to explore</span>
            <motion.div
              animate={prefersReducedMotion ? {} : { y: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
              className="p-1.5 rounded-full border border-[#D29C83]/50 group-hover:border-[#7C3F27]"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </motion.div>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
