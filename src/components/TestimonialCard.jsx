import React, { useState } from 'react';
import { Star, CheckCircle, ExternalLink } from 'lucide-react';
import { GoogleIcon } from './Icons';

/**
 * TestimonialCard (Google Maps Review Card)
 * Designed following Google Places API review standards.
 * Supports both local fallback data and dynamic API responses.
 */
export function TestimonialCard({ testimonial, isFeatured = false }) {
  const [imgError, setImgError] = useState(false);

  // Normalize fields between legacy schema and Google Places API schema
  const authorName = testimonial.author_name || testimonial.name || "Happy Customer";
  const quoteText = testimonial.text || testimonial.quote || "";
  const photoUrl = testimonial.profile_photo_url;
  const rating = testimonial.rating || 5;
  const timeDesc = testimonial.relative_time_description || testimonial.date || "Recent";
  const authorUrl = testimonial.author_url || "https://maps.google.com/?q=Pastry+Paws";
  const highlight = testimonial.highlight;

  // Extract initials for avatar fallback (e.g., "Clara & Julian M." -> "CJ")
  const initials = authorName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <div
      className="relative rounded-xl p-4 sm:p-5 transition-all duration-300 flex flex-col justify-between h-full border bg-[#FFF9F3] border-[#D29C83]/30 shadow-2xs hover:shadow-xs hover:border-[#D29C83]/60"
    >
      <div>
        {/* Header: Reviewer Avatar, Name, Timestamp & Google Logo */}
        <div className="flex items-start justify-between gap-2.5 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Avatar with fallback */}
            <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 bg-[#FEE5D2] border border-[#D29C83]/40 flex items-center justify-center text-xs font-semibold text-[#7C3F27]">
              {photoUrl && !imgError ? (
                <img
                  src={photoUrl}
                  alt={authorName}
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <span>{initials || "G"}</span>
              )}
            </div>

            {/* Author info */}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <cite className="not-italic font-medium text-xs sm:text-sm text-[#411C10] truncate block">
                  {authorName}
                </cite>
                <CheckCircle className="w-3 h-3 text-[#34A853] shrink-0" title="Verified Customer Review" />
              </div>
              <span className="text-[10px] sm:text-[11px] text-[#A66D54] block leading-tight">
                {timeDesc}
              </span>
            </div>
          </div>

          {/* Google G Brand Badge */}
          <a
            href={authorUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Verified Google Review"
            className="p-1 rounded-md hover:bg-[#FEE5D2] transition-colors shrink-0"
          >
            <GoogleIcon className="w-4 h-4" />
          </a>
        </div>

        {/* 5-Star Rating Row */}
        <div className="flex items-center gap-1 mb-2.5" aria-label={`${rating} out of 5 stars`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-3.5 h-3.5 ${
                i < rating
                  ? 'fill-[#FBBC05] text-[#FBBC05]'
                  : 'fill-transparent text-[#D29C83]/40'
              }`}
            />
          ))}
          <span className="text-[11px] font-semibold text-[#411C10] ml-1">
            {rating}.0
          </span>
        </div>

        {/* Review Text Body */}
        <p className="text-xs sm:text-[13px] text-[#411C10]/90 font-normal leading-relaxed italic line-clamp-4">
          "{quoteText}"
        </p>
      </div>

      {/* Footer: Highlight / Tag & Google Maps link */}
      <div className="mt-3.5 pt-2.5 border-t border-[#D29C83]/20 flex items-center justify-between text-[10px] text-[#7C3F27]">
        {highlight ? (
          <span className="bg-[#FEEDDD] px-2 py-0.5 rounded-full font-medium truncate max-w-[170px] border border-[#D29C83]/25">
            {highlight}
          </span>
        ) : (
          <span className="text-[#A66D54]">Google Maps Review</span>
        )}

        <a
          href={authorUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[#7C3F27] hover:text-[#411C10] transition-colors font-medium ml-auto shrink-0"
        >
          <span>Google</span>
          <ExternalLink className="w-2.5 h-2.5" />
        </a>
      </div>
    </div>
  );
}
