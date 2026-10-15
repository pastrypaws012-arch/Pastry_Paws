import React from 'react';
import { motion } from 'motion/react';
import { useReducedMotionPreference } from '../hooks/useReducedMotionPreference';

/**
 * AnimatedUnderline
 * Draws a hand-crafted calligraphic SVG brush stroke under headlines or script accents.
 * Triggers smoothly when scrolled into view.
 */
export function AnimatedUnderline({
  color = '#F7B6A7',
  strokeWidth = 3,
  delay = 0.3,
  duration = 0.85,
  variant = 'swoosh',
  withDot = true,
  className = '',
}) {
  const prefersReducedMotion = useReducedMotionPreference();

  // Paths crafted for organic artisanal look
  const paths = {
    swoosh: 'M 4 14 C 55 4, 130 19, 232 7',
    wave: 'M 4 11 Q 50 3, 100 12 T 195 11 T 235 7',
    loop: 'M 4 13 C 60 4, 110 18, 160 10 C 190 5, 215 15, 235 8',
  };

  const selectedPath = paths[variant] || paths.swoosh;

  return (
    <svg
      viewBox="0 0 240 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      className={`overflow-visible pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      {/* Secondary subtle shadow/whisper stroke for depth */}
      <motion.path
        d={selectedPath}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth * 0.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.35}
        transform="translate(1, 2)"
        initial={prefersReducedMotion ? { pathLength: 1, opacity: 0.35 } : { pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 0.35 }}
        viewport={{ once: true, margin: '-20px' }}
        transition={{
          duration: duration * 1.1,
          delay: delay + 0.15,
          ease: [0.16, 1, 0.3, 1],
        }}
      />

      {/* Main Artisan Brush Stroke */}
      <motion.path
        d={selectedPath}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={prefersReducedMotion ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true, margin: '-20px' }}
        transition={{
          duration,
          delay,
          ease: [0.16, 1, 0.3, 1],
        }}
      />

      {/* Sweet accent flick/dot at stroke endpoint */}
      {withDot && (
        <motion.circle
          cx="235"
          cy="7"
          r={strokeWidth * 0.9}
          fill={color}
          initial={prefersReducedMotion ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, margin: '-20px' }}
          transition={{
            duration: 0.35,
            delay: delay + duration * 0.8,
            type: 'spring',
            stiffness: 380,
            damping: 18,
          }}
        />
      )}
    </svg>
  );
}

/**
 * AnimatedScriptWord
 * Convenient inline wrapper that nests a script phrase and renders the animated underline underneath.
 */
export function AnimatedScriptWord({
  children,
  className = '',
  underlineColor = '#F7B6A7',
  delay = 0.4,
  variant = 'swoosh',
  underlineClassName = '',
  withDot = true,
}) {
  return (
    <span className={`relative inline-block ${className}`}>
      {children}
      <AnimatedUnderline
        color={underlineColor}
        delay={delay}
        variant={variant}
        withDot={withDot}
        className={`absolute -bottom-2 sm:-bottom-2.5 left-0 w-full h-3 sm:h-3.5 ${underlineClassName}`}
      />
    </span>
  );
}
