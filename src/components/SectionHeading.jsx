import React from 'react';
import { Reveal } from './Reveal';

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  accentScript,
  className = '',
  light = false,
}) {
  const alignClasses = {
    center: 'text-center mx-auto items-center',
    left: 'text-left items-start',
    right: 'text-right items-end',
  };

  return (
    <div className={`max-w-3xl flex flex-col ${alignClasses[align]} mb-12 md:mb-16 ${className}`}>
      {eyebrow && (
        <Reveal direction="down" duration={0.5}>
          <div className="flex items-center gap-2 mb-3">
            <span className={`h-px w-6 ${light ? 'bg-[#F7B6A7]' : 'bg-[#D29C83]'}`} />
            <span
              className={`text-xs md:text-sm tracking-[0.22em] uppercase font-semibold ${
                light ? 'text-[#F9C8B5]' : 'text-[#7C3F27]'
              }`}
            >
              {eyebrow}
            </span>
            <span className={`h-px w-6 ${light ? 'bg-[#F7B6A7]' : 'bg-[#D29C83]'}`} />
          </div>
        </Reveal>
      )}

      {accentScript && (
        <Reveal delay={0.1} duration={0.5}>
          <span className="font-script text-2xl md:text-3xl text-[#D29C83] -mb-1 block">
            {accentScript}
          </span>
        </Reveal>
      )}

      <Reveal delay={0.15} duration={0.6}>
        <h2
          className={`font-serif text-3xl sm:text-4xl md:text-5xl lg:text-5xl leading-[1.15] font-normal ${
            light ? 'text-[#FFF9F3]' : 'text-[#411C10]'
          }`}
        >
          {title}
        </h2>
      </Reveal>

      {subtitle && (
        <Reveal delay={0.25} duration={0.6}>
          <p
            className={`mt-4 text-base md:text-lg max-w-xl font-normal leading-relaxed ${
              light ? 'text-[#FEE5D2]' : 'text-[#7C3F27]'
            }`}
          >
            {subtitle}
          </p>
        </Reveal>
      )}
    </div>
  );
}
