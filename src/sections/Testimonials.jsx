import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SectionHeading } from '../components/SectionHeading';
import { TestimonialCard } from '../components/TestimonialCard';
import { testimonialsData, googlePlaceSummary } from '../data/testimonials';
import { Reveal } from '../components/Reveal';
import { GoogleIcon } from '../components/Icons';
import { Star, ExternalLink, PlusCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { API_BASE_URL } from '../utils/api';

export function Testimonials() {
  const [reviews, setReviews] = useState(testimonialsData);
  const [summary, setSummary] = useState(googlePlaceSummary);
  const [loading, setLoading] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const scrollRef = useRef(null);

  // Fetch dynamic Google Reviews from backend
  useEffect(() => {
    async function fetchGoogleReviews() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/google-reviews`);
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            if (Array.isArray(data.reviews) && data.reviews.length > 0) {
              const topRated = data.reviews.filter((r) => Number(r.rating) >= 4);
              if (topRated.length > 0) {
                setReviews(topRated);
              }
            }
            if (data.summary) {
              setSummary((prev) => ({
                ...prev,
                ...data.summary,
                googleMapsUrl: data.summary.googleMapsUrl || 'https://maps.app.goo.gl/NrA698fpTvKPwvKx6',
              }));
            }
          }
        }
      } catch (err) {
        console.warn('Could not load dynamic Google reviews, using fallback cache:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchGoogleReviews();
  }, []);

  // Update scroll boundaries & active dot index
  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

    // Approximate active item index based on scroll position
    const cardWidth = el.firstElementChild?.offsetWidth || clientWidth;
    const gap = 16;
    const newIndex = Math.round(scrollLeft / (cardWidth + gap));
    setActiveIndex(Math.min(Math.max(newIndex, 0), reviews.length - 1));
  }, [reviews.length]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);
    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [updateScrollState, reviews]);

  // Scroll actions
  const scrollPrev = () => {
    const el = scrollRef.current;
    if (!el) return;
    const step = el.clientWidth * 0.75;
    el.scrollBy({ left: -step, behavior: 'smooth' });
  };

  const scrollNext = () => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    // Loop back to start if at the end
    if (scrollLeft >= scrollWidth - clientWidth - 15) {
      el.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      const step = el.clientWidth * 0.75;
      el.scrollBy({ left: step, behavior: 'smooth' });
    }
  };

  const scrollToIndex = (index) => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.children[index];
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    }
  };

  // Subtle auto-advance every 6 seconds (pauses on hover)
  useEffect(() => {
    if (isPaused || reviews.length <= 1) return;
    const interval = setInterval(() => {
      scrollNext();
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused, reviews.length]);

  // Clean formatted review count
  const formattedCount =
    summary.reviewsCount && !summary.reviewsCount.includes('★')
      ? `${summary.reviewsCount} Reviews`
      : `${reviews.length} Verified Reviews`;

  return (
    <section
      id="testimonials"
      className="py-12 md:py-16 bg-[#FEEDDD] relative overflow-hidden"
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
          className="mb-6 md:mb-8"
        />

        {/* Google Maps Trust & Rating Summary Badge */}
        <Reveal delay={0.15} duration={0.5}>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mb-8 text-xs text-[#7C3F27]">
            <div className="inline-flex items-center gap-2 bg-[#FFF9F3] border border-[#D29C83]/40 px-3.5 py-1.5 rounded-full shadow-2xs">
              <GoogleIcon className="w-4 h-4" />
              <span className="font-semibold text-[#411C10]">Google Reviews</span>
              <span className="text-[#D29C83]">•</span>
              <div className="flex items-center gap-0.5 text-[#FBBC05]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <span className="font-bold text-[#411C10]">5.0</span>
              <span className="text-[#A66D54]">({formattedCount})</span>
            </div>

            <a
              href={summary.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-[#7C3F27] hover:text-[#411C10] font-medium underline underline-offset-4 transition-colors"
            >
              <span>View all on Google Maps</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </Reveal>

        {/* Interactive Reviews Carousel Track */}
        <div
          className="relative group/carousel"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {/* Desktop Floating Left Navigation Button */}
          {reviews.length > 3 && (
            <button
              type="button"
              onClick={scrollPrev}
              disabled={!canScrollLeft}
              aria-label="Previous customer reviews"
              className={`hidden md:flex absolute -left-3.5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full items-center justify-center bg-[#FFF9F3]/95 border border-[#D29C83]/50 text-[#7C3F27] shadow-md transition-all duration-200 cursor-pointer ${
                canScrollLeft
                  ? 'hover:bg-[#7C3F27] hover:text-[#FFF9F3] hover:scale-105 active:scale-95'
                  : 'opacity-30 cursor-not-allowed'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* Desktop Floating Right Navigation Button */}
          {reviews.length > 3 && (
            <button
              type="button"
              onClick={scrollNext}
              aria-label="Next customer reviews"
              className="hidden md:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full items-center justify-center bg-[#FFF9F3]/95 border border-[#D29C83]/50 text-[#7C3F27] shadow-md hover:bg-[#7C3F27] hover:text-[#FFF9F3] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          {/* Horizontal Smooth Scrollable Cards Container */}
          <div
            ref={scrollRef}
            className="flex items-stretch gap-4 sm:gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory py-4 px-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {reviews.map((item, index) => (
              <div
                key={item.id || item._id || index}
                className="w-[84vw] sm:w-[340px] md:w-[350px] lg:w-[calc(33.333%-14px)] shrink-0 snap-start flex flex-col self-stretch"
              >
                <TestimonialCard
                  testimonial={item}
                  isFeatured={false}
                />
              </div>
            ))}
          </div>

          {/* Carousel Pagination & Mobile Controls Bar */}
          <div className="mt-6 flex items-center justify-between sm:justify-center gap-3">
            {/* Mobile Prev Arrow */}
            <button
              type="button"
              onClick={scrollPrev}
              disabled={!canScrollLeft}
              aria-label="Previous review"
              className={`md:hidden flex items-center justify-center w-8 h-8 rounded-full bg-[#FFF9F3] border border-[#D29C83]/40 text-[#7C3F27] shadow-2xs ${
                canScrollLeft ? 'active:bg-[#7C3F27] active:text-[#FFF9F3]' : 'opacity-30'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Clickable Pagination Dots */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {reviews.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  type="button"
                  onClick={() => scrollToIndex(dotIdx)}
                  aria-label={`Jump to review ${dotIdx + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    activeIndex === dotIdx
                      ? 'w-6 bg-[#7C3F27]'
                      : 'w-2 bg-[#D29C83]/40 hover:bg-[#7C3F27]/60'
                  }`}
                />
              ))}
            </div>

            {/* Mobile Next Arrow */}
            <button
              type="button"
              onClick={scrollNext}
              aria-label="Next review"
              className="md:hidden flex items-center justify-center w-8 h-8 rounded-full bg-[#FFF9F3] border border-[#D29C83]/40 text-[#7C3F27] shadow-2xs active:bg-[#7C3F27] active:text-[#FFF9F3]"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Footer Note & Call to Action */}
        <Reveal delay={0.3} duration={0.6}>
          <div className="mt-7 text-center flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-[#A66D54]">
            <span>Verified 5.0 Star Rating on Google Maps</span>
            <span className="hidden sm:inline text-[#D29C83]">•</span>
            <a
              href={summary.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[#7C3F27] hover:text-[#411C10] font-medium transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#F7B6A7]" />
              <span>Review Pastry Paws on Google</span>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
