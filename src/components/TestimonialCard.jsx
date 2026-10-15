import React from 'react';
import { Quote } from 'lucide-react';

export function TestimonialCard({ testimonial, isFeatured = false }) {
  return (
    <div
      className={`relative rounded-2xl p-7 sm:p-9 transition-all duration-300 flex flex-col justify-between border ${
        isFeatured
          ? 'bg-[#FEE5D2] border-[#D29C83] shadow-sm'
          : 'bg-[#FFF9F3] border-[#D29C83]/30'
      }`}
    >
      {/* Decorative delicate quote mark */}
      <div className="text-[#F7B6A7] mb-4">
        <Quote className="w-8 h-8 opacity-70" />
      </div>

      <blockquote className="font-serif text-lg sm:text-xl text-[#411C10] font-normal leading-relaxed italic">
        "{testimonial.quote}"
      </blockquote>

      <div className="mt-6 pt-5 border-t border-[#D29C83]/20 flex items-center justify-between">
        <div>
          <cite className="not-italic font-medium text-sm text-[#411C10] block">
            {testimonial.name}
          </cite>
          <span className="text-xs text-[#7C3F27] block mt-0.5 font-normal">
            {testimonial.occasion}
          </span>
        </div>

        {testimonial.highlight && (
          <span className="text-[11px] font-sans font-medium text-[#7C3F27] bg-[#FEEDDD] px-3 py-1 rounded-full border border-[#D29C83]/30 hidden sm:inline-block">
            {testimonial.highlight}
          </span>
        )}
      </div>
    </div>
  );
}
