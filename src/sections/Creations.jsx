import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { SectionHeading } from '../components/SectionHeading';
import { PortfolioCard } from '../components/PortfolioCard';
import { ImageLightbox } from '../components/ImageLightbox';
import { categories, creationsData } from '../data/creations';
import { Reveal } from '../components/Reveal';

export function Creations() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeLightboxIndex, setActiveLightboxIndex] = useState(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const scrollRef = useRef(null);

  // Filter items by category
  const filteredItems = creationsData.filter((item) => {
    if (selectedCategory === 'All') return true;
    return item.category === selectedCategory;
  });

  // Check scroll positions
  const updateScrollButtons = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', updateScrollButtons, { passive: true });
      updateScrollButtons();
      window.addEventListener('resize', updateScrollButtons);
      return () => {
        el.removeEventListener('scroll', updateScrollButtons);
        window.removeEventListener('resize', updateScrollButtons);
      };
    }
  }, [updateScrollButtons, filteredItems]);

  // Reset scroll to left when category changes
  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  };

  // Scroll by card width * 2
  const scroll = (direction) => {
    if (scrollRef.current) {
      const cardWidth = 260;
      const scrollAmount = direction === 'left' ? -cardWidth * 2 : cardWidth * 2;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleOpenLightbox = (index) => {
    setActiveLightboxIndex(index);
  };

  const handleCloseLightbox = () => {
    setActiveLightboxIndex(null);
  };

  const handlePrevLightbox = () => {
    if (activeLightboxIndex !== null) {
      setActiveLightboxIndex((prev) =>
        prev > 0 ? prev - 1 : filteredItems.length - 1
      );
    }
  };

  const handleNextLightbox = () => {
    if (activeLightboxIndex !== null) {
      setActiveLightboxIndex((prev) =>
        prev < filteredItems.length - 1 ? prev + 1 : 0
      );
    }
  };

  const currentLightboxItem =
    activeLightboxIndex !== null ? filteredItems[activeLightboxIndex] : null;

  return (
    <section
      id="creations"
      className="py-16 md:py-24 bg-[#FDEADA] relative overflow-hidden"
    >
      {/* Decorative top border line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-[#D29C83]/30" />

      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <SectionHeading
          eyebrow="MADE WITH CARE"
          accentScript="Signature Portfolio"
          title="A little gallery of happiness"
          subtitle="Every creation tells its own sweet story, handcrafted with delicate finishes and seasonal inspirations."
          align="center"
        />

        {/* Category Filter Pills & Carousel Navigation Header */}
        <Reveal delay={0.2} duration={0.6}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategorySelect(cat)}
                    className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm tracking-wide transition-all duration-300 font-medium ${
                      isActive
                        ? 'bg-[#7C3F27] text-[#FEEDDD] shadow-xs'
                        : 'bg-[#FEEDDD] text-[#7C3F27] border border-[#D29C83]/40 hover:bg-[#FEE5D2]'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Navigation Arrow Controls */}
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
                className={`p-2.5 rounded-full border transition-all duration-200 flex items-center justify-center ${
                  !canScrollLeft
                    ? 'border-[#D29C83]/30 text-[#D29C83]/40 cursor-not-allowed bg-transparent'
                    : 'border-[#7C3F27] text-[#7C3F27] bg-[#FEEDDD] hover:bg-[#7C3F27] hover:text-[#FEEDDD] shadow-xs active:scale-95'
                }`}
                aria-label="Scroll creations left"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
                className={`p-2.5 rounded-full border transition-all duration-200 flex items-center justify-center ${
                  !canScrollRight
                    ? 'border-[#D29C83]/30 text-[#D29C83]/40 cursor-not-allowed bg-transparent'
                    : 'border-[#7C3F27] text-[#7C3F27] bg-[#FEEDDD] hover:bg-[#7C3F27] hover:text-[#FEEDDD] shadow-xs active:scale-95'
                }`}
                aria-label="Scroll creations right"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </Reveal>

        {/* One-Lined Horizontal Scroll Track */}
        <div className="relative -mx-5 sm:-mx-8 px-5 sm:px-8">
          <div
            ref={scrollRef}
            className="flex items-stretch gap-4 sm:gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-5 pt-1 no-scrollbar focus:outline-none"
            tabIndex={0}
            role="region"
            aria-label="Creations carousel"
          >
            {filteredItems.map((item, index) => (
              <PortfolioCard
                key={item.id}
                item={item}
                onClick={() => handleOpenLightbox(index)}
                priority={index < 4}
              />
            ))}
          </div>
        </div>

        {/* Gallery Footer Note with Scroll Hint */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#7C3F27] gap-3 pt-4 border-t border-[#D29C83]/20">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#F7B6A7]" />
            <span>Swipe or click arrows to explore all {filteredItems.length} creations</span>
          </div>

          <a
            href="#contact"
            className="font-medium text-xs sm:text-sm text-[#411C10] hover:text-[#7C3F27] underline underline-offset-4 transition-colors"
          >
            Inquire about custom dates &rarr;
          </a>
        </div>
      </div>

      {/* Accessible Lightbox Modal */}
      <ImageLightbox
        isOpen={activeLightboxIndex !== null}
        item={currentLightboxItem}
        items={filteredItems}
        onClose={handleCloseLightbox}
        onPrev={filteredItems.length > 1 ? handlePrevLightbox : undefined}
        onNext={filteredItems.length > 1 ? handleNextLightbox : undefined}
      />
    </section>
  );
}
