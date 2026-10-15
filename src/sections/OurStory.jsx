import React from 'react';
import { motion } from 'motion/react';
import { brandConfig } from '../data/brand';
import { Reveal, StaggerContainer, StaggerItem } from '../components/Reveal';
import { AnimatedScriptWord } from '../components/AnimatedUnderline';
import { Sparkles, Heart, Utensils } from 'lucide-react';

export function OurStory() {
  const icons = [Sparkles, Heart, Utensils];

  return (
    <section
      id="story"
      className="pt-8 pb-16 md:pt-12 md:pb-24 bg-[#FEEDDD] relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Baker & Behind-the-Scenes Photograph */}
          <div className="lg:col-span-5 relative order-2 lg:order-1">
            <Reveal direction="left" duration={0.8}>
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Vintage decorative offset frame */}
                <div className="absolute -inset-3 sm:-inset-4 rounded-3xl border border-[#D29C83]/50 rotate-2 pointer-events-none" />
                <div className="absolute -inset-3 sm:-inset-4 rounded-3xl bg-[#FEE5D2] -rotate-1 -z-10" />

                {/* Main image container */}
                <div className="relative rounded-2xl overflow-hidden shadow-lg aspect-4/5 bg-[#FDEADA]">
                  <img
                    src="/images/baker-story.jpg"
                    alt="Artisan baker lovingly placing delicate edible botanicals on a tiered cake"
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-103"
                  />

                  {/* Stamp detail */}
                  <div className="absolute bottom-4 right-4 bg-[#FEEDDD]/90 backdrop-blur-xs p-3 rounded-xl border border-[#D29C83]/40 text-center">
                    <span className="font-script text-xl text-[#7C3F27] block leading-none">
                      Artisan Kitchen
                    </span>
                    <span className="text-[10px] tracking-widest uppercase font-semibold text-[#411C10]">
                      Small Batch
                    </span>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Right Column: Editorial Story & Brand Values */}
          <div className="lg:col-span-7 flex flex-col justify-center order-1 lg:order-2">
            {/* Eyebrow */}
            <Reveal direction="down" duration={0.5}>
              <div className="flex items-center gap-2 mb-3">
                <span className="h-px w-6 bg-[#D29C83]" />
                <span className="text-xs sm:text-sm tracking-[0.25em] uppercase font-semibold text-[#7C3F27]">
                  {brandConfig.story.eyebrow}
                </span>
              </div>
            </Reveal>

            {/* Headline */}
            <Reveal delay={0.1} duration={0.6}>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#411C10] font-normal leading-[1.15]">
                {brandConfig.story.headline}
              </h2>
            </Reveal>

            {/* Script Tagline Accent */}
            <Reveal delay={0.2} duration={0.6}>
              <p className="font-script text-2xl sm:text-3xl text-[#7C3F27] mt-2 mb-4">
                "Baking is the art of turning simple ingredients into{' '}
                <AnimatedScriptWord
                  underlineColor="#D29C83"
                  delay={0.4}
                  variant="loop"
                  className="text-[#7C3F27]"
                >
                  lasting memories.
                </AnimatedScriptWord>
                "
              </p>
            </Reveal>

            {/* Story Paragraph */}
            <Reveal delay={0.25} duration={0.6}>
              <p className="text-base sm:text-lg text-[#7C3F27] leading-relaxed font-normal">
                {brandConfig.story.description}
              </p>
            </Reveal>

            {/* Three Core Brand Values */}
            <StaggerContainer
              delayChildren={0.35}
              staggerChildren={0.12}
              className="mt-8 sm:mt-10 space-y-4"
            >
              {brandConfig.story.values.map((val, idx) => {
                const IconComponent = icons[idx] || Sparkles;
                return (
                  <StaggerItem key={val.title}>
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-[#FFF9F3]/70 border border-[#D29C83]/30">
                      <div className="p-2 rounded-lg bg-[#FEE5D2] text-[#7C3F27] mt-0.5">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-serif text-lg font-medium text-[#411C10]">
                          {val.title}
                        </h4>
                        <p className="text-xs sm:text-sm text-[#7C3F27] mt-0.5 leading-relaxed font-normal">
                          {val.description}
                        </p>
                      </div>
                    </div>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
