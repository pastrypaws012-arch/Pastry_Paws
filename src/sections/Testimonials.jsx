import React, { useState, useEffect } from 'react';
import { SectionHeading } from '../components/SectionHeading';
import { TestimonialCard } from '../components/TestimonialCard';
import { testimonialsData, googlePlaceSummary } from '../data/testimonials';
import { StaggerContainer, StaggerItem, Reveal } from '../components/Reveal';
import { GoogleIcon } from '../components/Icons';
import { Star, ExternalLink, PlusCircle } from 'lucide-react';

export function Testimonials() {
  // State designed for future dynamic fetching from Google Places API / backend endpoint
  const [reviews, setReviews] = useState(testimonialsData);
  const [summary, setSummary] = useState(googlePlaceSummary);
  const [loading, setLoading] = useState(false);

  /*
   * FUTURE GOOGLE MAPS FETCHING HOOK:
   * When you are ready to fetch live Google Reviews, simply uncomment and provide your endpoint:
   *
   * useEffect(() => {
   *   async function fetchGoogleReviews() {
   *     try {
   *       setLoading(true);
   *       const res = await fetch('/api/google-reviews');
   *       const data = await res.json();
   *       if (data.reviews) setReviews(data.reviews);
   *       if (data.summary) setSummary(data.summary);
   *     } catch (err) {
   *       console.error("Failed to load live Google reviews, using cache:", err);
   *     } finally {
   *       setLoading(false);
   *     }
   *   }
   *   fetchGoogleReviews();
   * }, []);
   */

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
              <span className="font-bold text-[#411C10]">{summary.rating}.0</span>
              <span className="text-[#A66D54]">({summary.reviewsCount})</span>
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

        {/* Reviews Grid (Google Places API card layout) */}
        <StaggerContainer
          staggerChildren={0.08}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5"
        >
          {reviews.map((item, index) => (
            <StaggerItem key={item.id || index} className="h-full">
              <TestimonialCard
                testimonial={item}
                isFeatured={index === 0}
              />
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Footer Note & Call to Action */}
        <Reveal delay={0.3} duration={0.6}>
          <div className="mt-8 text-center flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-[#A66D54]">
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
