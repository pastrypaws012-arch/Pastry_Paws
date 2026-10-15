import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

export function Button({
  children,
  variant = 'primary',
  href,
  onClick,
  icon = false,
  className = '',
  external = false,
  ariaLabel,
  type = 'button',
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-300 rounded-full text-sm md:text-base tracking-wide focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3F27] focus-visible:ring-offset-2';

  const variants = {
    primary:
      'bg-[#7C3F27] text-[#FEEDDD] px-7 py-3.5 shadow-sm hover:bg-[#5E2B19] hover:shadow active:scale-[0.98]',
    secondary:
      'border border-[#7C3F27] text-[#7C3F27] bg-[#FEEDDD]/40 px-6 py-3 hover:bg-[#7C3F27] hover:text-[#FEEDDD] active:scale-[0.98]',
    soft:
      'bg-[#FEE5D2] text-[#7C3F27] border border-[#D29C83]/50 px-6 py-3 hover:bg-[#F7B6A7]/40 active:scale-[0.98]',
    link:
      'text-[#7C3F27] p-0 font-medium group hover:text-[#411C10] inline-flex items-center gap-1.5 underline-offset-4 hover:underline',
  };

  const content = (
    <>
      <span>{children}</span>
      {icon && (
        <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
      )}
    </>
  );

  const combinedClasses = `${baseStyles} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <a
        href={href}
        className={`group ${combinedClasses}`}
        aria-label={ariaLabel}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        onClick={onClick}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      className={`group ${combinedClasses}`}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {content}
    </button>
  );
}
